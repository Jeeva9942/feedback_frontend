import { createClient } from "@supabase/supabase-js";

// ─── Supabase Admin Client ─────────────────────────────────────────────────
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

// ─── Department → Feedback Table Name Map ────────────────────────────────
// Add any department whose table name differs from the default pattern
// Default pattern: dept.toLowerCase() + '_feedback'  e.g. CT → ct_feedback
const DEPT_TABLE_MAP = {
  MC: 'mcs_feedback',          // Mechatronics
  PT: 'pt_feedback',           // Printing Technology
  MECH_AIDED: 'mech_aided_feedback',   // Mechanical Engineering – Aided
  MECH_SF: 'mechanical_sf_feedback',// Mechanical Engineering – Self-Finance
  CT: 'ct_feedback',
  CE: 'ce_feedback',
  ME: 'me_feedback',
  MES: 'mes_feedback',
  AE: 'ae_feedback',
  RAC: 'rac_feedback',
  'R&AC': 'rac_feedback',          // DB alias for RAC
  ECE: 'ece_feedback',
  EEE: 'eee_feedback',
  TT: 'tt_feedback',
  CCN: 'ccn_feedback',
};

/**
 * Normalize department codes that differ between DB and frontend.
 * e.g. DB stores 'R&AC' but frontend expects 'RAC'
 */
function normalizeDept(dept) {
  const d = (dept || '').trim();
  if (d === 'R&AC') return 'RAC';
  return d;
}

/** Resolve the feedback table name for a given department code */
function getFeedbackTable(department) {
  const key = (department || '').toUpperCase().trim();
  return DEPT_TABLE_MAP[key] || `${key.toLowerCase()}_feedback`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function sendJson(res, status, data) {
  res.setHeader("Content-Type", "application/json");
  res.status(status).json(data);
}

// ─── Route: POST /api/login ───────────────────────────────────────────────
async function handleLogin(req, res) {
  const { role, rollNo, username, password } = req.body || {};

  try {
    if (role === "student") {
      const rollUpper = (rollNo || "").toUpperCase();

      // Retry logic for flaky connections
      let student = null;
      for (let attempt = 0; attempt <= 2; attempt++) {
        const { data, error } = await supabaseAdmin
          .from("all_students")
          .select("*")
          .eq("rollno", rollUpper)
          .single();

        if (error && error.code !== "PGRST116") {
          if (attempt === 2) {
            return sendJson(res, 500, {
              error: "Database connection failed.",
              details: "Ensure Supabase is reachable and your project URL is correct.",
            });
          }
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        student = data;
        break;
      }

      if (!student) {
        return sendJson(res, 401, { error: "Invalid Login Credentials - Student not found" });
      }

      const alreadySubmitted =
        student.status === true || student.status === "TRUE" || student.hasSubmitted === true;

      if (alreadySubmitted) {
        return sendJson(res, 403, {
          error: "Feedback already submitted",
          suggestedAction: "Please contact the department admin if you believe this is an error.",
        });
      }

      const pwd = (password || "").toUpperCase();
      const roll = (student.rollno || "").toUpperCase();

      if (roll !== pwd) {
        return sendJson(res, 401, { error: "Invalid Login Credentials (Roll No/Password mismatch)" });
      }

      return sendJson(res, 200, {
        user: {
          role: "student",
          rollNo: student.rollno,
          name: student.name,
          // Normalize 'R&AC' → 'RAC' so the frontend type system works correctly
          department: normalizeDept(student.department) || "CT",
          hasSubmitted: alreadySubmitted,
        },
      });
    } else if (role === "admin") {
      if (username === "admin" && password === "admin123") {
        return sendJson(res, 200, { user: { role: "admin", username: "admin" } });
      }
      return sendJson(res, 401, { error: "Invalid Admin Credentials" });
    } else {
      return sendJson(res, 400, { error: "Invalid role specified" });
    }
  } catch (err) {
    console.error("[LOGIN ERROR]:", err);
    return sendJson(res, 500, { error: "Internal server error during login" });
  }
}

// ─── Route: GET /api/students ─────────────────────────────────────────────
async function handleGetStudents(res) {
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const { data, error } = await supabaseAdmin
        .from("all_students")
        .select("*")
        .order("rollno", { ascending: true });

      if (error) throw new Error(error.message);

      const mapped = (data || []).map((s) => ({
        rollNo: s.rollno,
        name: s.name,
        // Normalize 'R&AC' → 'RAC' so admin filters and charts work correctly
        department: normalizeDept(s.department),
        hasSubmitted: s.status,
      }));

      return sendJson(res, 200, mapped);
    } catch (err) {
      if (attempt === 3) {
        console.error("[GET STUDENTS ERROR]:", err.message);
        return sendJson(res, 500, { error: `Database Error: ${err.message}` });
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

// ─── Route: POST /api/feedback ────────────────────────────────────────────
async function handleSubmitFeedback(req, res) {
  const feedbackData = req.body || {};
  const { rollNo, department, answers } = feedbackData;

  if (!rollNo) {
    return sendJson(res, 400, { error: "Roll number is required to submit feedback" });
  }

  try {
    // 1. Increment question-wise counters
    if (department && Array.isArray(answers)) {
      const tableName = getFeedbackTable(department);
      const now = new Date().toISOString();

      for (const ans of answers) {
        let code = "";
        if (ans.section === "facilities") code = `A${ans.questionId}`;
        else if (ans.section === "participation") code = `B${ans.questionId}`;
        else if (ans.section === "accomplishment") code = `C${ans.questionId}`;

        if (!code) continue;

        const ratingCol = { 4: "very_good_4", 3: "good_3", 2: "average_2", 1: "below_average_1" }[ans.rating];
        if (!ratingCol) continue;

        // ── Reliable increment with retry ────────────────────────────────
        // Read the current row, compute new values, write all back atomically.
        // total_count is ALWAYS the arithmetic sum of the four rating columns
        // so it can NEVER drift out of sync (old RPC path didn't update it).
        let retries = 0;
        while (retries < 3) {
          try {
            const { data: row, error: fetchErr } = await supabaseAdmin
              .from(tableName)
              .select("very_good_4, good_3, average_2, below_average_1")
              .eq("question_code", code)
              .single();

            if (fetchErr || !row) {
              console.warn(`[FEEDBACK] Could not fetch row ${code}:`, fetchErr?.message);
              break;
            }

            const newVG = (row.very_good_4 || 0) + (ratingCol === "very_good_4" ? 1 : 0);
            const newG = (row.good_3 || 0) + (ratingCol === "good_3" ? 1 : 0);
            const newAv = (row.average_2 || 0) + (ratingCol === "average_2" ? 1 : 0);
            const newBA = (row.below_average_1 || 0) + (ratingCol === "below_average_1" ? 1 : 0);
            // Compute total as real sum — never a separately-tracked counter
            const newTotal = newVG + newG + newAv + newBA;

            const { error: updateErr } = await supabaseAdmin
              .from(tableName)
              .update({
                very_good_4: newVG,
                good_3: newG,
                average_2: newAv,
                below_average_1: newBA,
                total_count: newTotal,
                updated_at: now,
              })
              .eq("question_code", code);

            if (updateErr) {
              console.warn(`[FEEDBACK] Update failed ${code} (attempt ${retries + 1}):`, updateErr.message);
              retries++;
              await new Promise((r) => setTimeout(r, 300));
              continue;
            }
            break; // success
          } catch (err) {
            console.warn(`[FEEDBACK] Exception for ${code}:`, err.message);
            retries++;
            await new Promise((r) => setTimeout(r, 300));
          }
        }
      }
    }

    // 2. Mark student as submitted
    const rollUpper = rollNo.toUpperCase();
    const { error: updateErr } = await supabaseAdmin
      .from("all_students")
      .update({ status: true })
      .eq("rollno", rollUpper);

    if (updateErr) throw new Error(updateErr.message);

    return sendJson(res, 201, { message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("[SUBMIT FEEDBACK ERROR]:", err);
    return sendJson(res, 500, { error: `Database Error: ${err.message}` });
  }
}

// ─── Route: GET /api/feedback/:department ──────────────────────────────────
async function handleGetFeedback(req, res, department) {
  const tableName =
    department && department !== "ALL"
      ? getFeedbackTable(department)
      : "ct_feedback";

  try {
    const { data, error } = await supabaseAdmin.from(tableName).select("*");

    if (error) {
      // 42P01 = table does not exist yet — return empty array gracefully
      if (error.code === "42P01") {
        console.warn(`[FEEDBACK] Table "${tableName}" not found in Supabase. Run CREATE TABLE first.`);
        return sendJson(res, 200, []);
      }
      // Any other DB error — expose real message for diagnosis
      console.error(`[FEEDBACK ERROR] ${tableName} | ${error.code}: ${error.message}`);
      return sendJson(res, 500, {
        error: `Database error querying ${tableName}`,
        detail: error.message,
        code: error.code,
        data: [],
      });
    }

    // Always return an array — never a plain object
    return sendJson(res, 200, Array.isArray(data) ? data : []);
  } catch (err) {
    console.error(`[FEEDBACK EXCEPTION] ${tableName} |`, err.message);
    return sendJson(res, 500, { error: err.message, data: [] });
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS headers (important for local dev / custom domains)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const url = req.url || "";
  const method = req.method || "GET";

  // POST /api/login
  if (url === "/api/login" && method === "POST") {
    return handleLogin(req, res);
  }

  // GET /api/students
  if (url === "/api/students" && method === "GET") {
    return handleGetStudents(res);
  }

  // POST /api/feedback
  if (url === "/api/feedback" && method === "POST") {
    return handleSubmitFeedback(req, res);
  }

  // GET /api/feedback/:department  — e.g. /api/feedback/CT
  const feedbackMatch = url.match(/^\/api\/feedback\/([^/?]+)/);
  if (feedbackMatch && method === "GET") {
    return handleGetFeedback(req, res, feedbackMatch[1]);
  }

  // GET /api  — health check
  if (url === "/api" && method === "GET") {
    return sendJson(res, 200, { message: "NPTC Feedback API is running ✅" });
  }

  return sendJson(res, 404, { error: "Route not found" });
}

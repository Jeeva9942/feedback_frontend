import { createClient } from "@supabase/supabase-js";

// ─── Supabase Admin Client ─────────────────────────────────────────────────
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

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
          department: student.department || "CT",
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
        department: s.department,
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
      const tableName = `${department.toLowerCase()}_feedback`;
      const now = new Date().toISOString();

      for (const ans of answers) {
        let code = "";
        if (ans.section === "facilities") code = `A${ans.questionId}`;
        else if (ans.section === "participation") code = `B${ans.questionId}`;
        else if (ans.section === "accomplishment") code = `C${ans.questionId}`;

        if (!code) continue;

        const ratingCol = { 4: "very_good_4", 3: "good_3", 2: "average_2", 1: "below_average_1" }[ans.rating];
        if (!ratingCol) continue;

        try {
          // Try RPC first (atomic)
          const { error: rpcError } = await supabaseAdmin.rpc("increment_question_counter", {
            t_name: tableName,
            q_code: code,
            rating_col: ratingCol,
          });

          if (rpcError) {
            // Manual fallback
            const { data: row, error: fetchErr } = await supabaseAdmin
              .from(tableName)
              .select("*")
              .eq("question_code", code)
              .single();

            if (!fetchErr && row) {
              await supabaseAdmin
                .from(tableName)
                .update({
                  total_count: (row.total_count || 0) + 1,
                  [ratingCol]: (row[ratingCol] || 0) + 1,
                  updated_at: now,
                })
                .eq("question_code", code);
            }
          }
        } catch (err) {
          console.warn(`Could not increment counter for ${code}:`, err.message);
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

// ─── Route: GET /api/feedback/:department ────────────────────────────────
async function handleGetFeedback(req, res, department) {
  try {
    const tableName =
      department && department !== "ALL"
        ? `${department.toLowerCase()}_feedback`
        : "ct_feedback";

    const { data, error } = await supabaseAdmin.from(tableName).select("*");
    if (error) throw new Error(error.message);

    return sendJson(res, 200, data || []);
  } catch (err) {
    console.error("[GET FEEDBACK ERROR]:", err.message);
    return sendJson(res, 500, { error: "Failed to load feedback" });
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

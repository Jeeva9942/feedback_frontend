export interface PSO {
    pso1: string;
    pso2: string;
}

/** Department-specific Program Specific Outcomes — NPTC */
export const DEPARTMENT_PSO: Record<string, PSO> = {
    // 📌 Core Departments
    CE: {
        pso1: 'Perform digital surveying, prepare plans and estimation using advanced software tools.',
        pso2: 'Work effectively in multidisciplinary environments for infrastructure development.',
    },
    ME: {
        pso1: 'Design and develop mechanical products using modern CAD/CAM and quality control tools.',
        pso2: 'Demonstrate functional competencies aligned with industrial practices.',
    },
    MES: {
        pso1: 'Design and develop mechanical products through experiential industrial learning.',
        pso2: 'Apply technical skills gained through industry exposure to solve engineering problems.',
    },
    AE: {
        pso1: 'Apply the core knowledge and technological advances in automotive industries.',
        pso2: 'Demonstrate proficiency in the use of automobile shop tools and equipment to diagnose and repair vehicle systems.',
    },
    RAC: {
        pso1: 'Design and develop refrigeration and air-conditioning systems using modern technology.',
        pso2: 'Apply acquired knowledge for sustainable industrial and societal development.',
    },
    MC: {
        pso1: 'Integrate mechanical, electronic, and computing systems to design and develop mechatronic products.',
        pso2: 'Apply mechatronics principles to automate and optimize industrial processes for societal benefit.',
    },

    // ⚡ Circuit Departments
    ECE: {
        pso1: 'Design and develop electronic and communication systems using modern engineering tools.',
        pso2: 'Apply electronics and communication knowledge for industrial and societal development.',
    },
    EEE: {
        pso1: 'Design and develop electrical systems and apply power electronics for industrial applications.',
        pso2: 'Demonstrate competency in electrical installation, maintenance, and energy management.',
    },

    // 💻 Other Departments
    CT: {
        pso1: 'Develop need-based applications using appropriate computing technologies.',
        pso2: 'Apply acquired computing skills for societal and industrial benefits.',
    },
    TT: {
        pso1: 'Manage various sections of textile mills using discipline knowledge.',
        pso2: 'Apply technical and professional skills for sustainable growth and societal development.',
    },
    PT: {
        pso1: 'Hands-on training with complete in-house production setup.',
        pso2: 'Gain domain knowledge through professional software used in printing and allied industries.',
    },
    CCN: {
        pso1: 'Design and implement computer communication networks using modern networking technologies.',
        pso2: 'Apply networking and communication skills to solve real-world connectivity and infrastructure problems.',
    },

    // Generic fallback
    DEFAULT: {
        pso1: 'Apply discipline-specific knowledge and technical skills to solve real-world engineering problems.',
        pso2: 'Demonstrate professional competence aligned with industry needs for societal and industrial development.',
    },
};

/** Returns the PSO for a given department code, with a safe fallback */
export function getDeptPSO(department: string): PSO {
    return DEPARTMENT_PSO[department?.toUpperCase()] ?? DEPARTMENT_PSO['DEFAULT'];
}

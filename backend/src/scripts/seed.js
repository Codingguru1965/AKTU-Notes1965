import { connectDB, disconnectDB } from '../config/db.js';
import { Resource } from '../models/Resource.js';

const sampleResources = [
  // 1. CSE Year 2, Semester 3 - Data Structures
  {
    title: 'Data Structures and Algorithms Complete Lecture Notes',
    resourceType: 'Notes',
    branch: 'CSE',
    year: 2,
    semester: 3,
    subjectCode: 'KCS301',
    subjectName: 'Data Structures',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/cse/KCS301-data-structures-notes.pdf',
    academicYear: '2024-25',
    regulation: 'CBCS',
    description: 'Comprehensive handwritten & typed notes covering arrays, stacks, queues, linked lists, trees, graphs, and hashing according to latest AKTU syllabus.',
    isPublished: true
  },
  {
    title: 'Data Structures Official AKTU Syllabus & Course Outcomes',
    resourceType: 'Syllabus',
    branch: 'CSE',
    year: 2,
    semester: 3,
    subjectCode: 'KCS301',
    subjectName: 'Data Structures',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/cse/KCS301-syllabus.pdf',
    academicYear: '2024-25',
    regulation: 'CBCS',
    description: 'Unit-wise syllabus breakdown, textbook references, and question pattern for KCS301.',
    isPublished: true
  },
  {
    title: 'Data Structures 2023-24 Previous Year End-Semester Paper',
    resourceType: 'PYQ',
    branch: 'CSE',
    year: 2,
    semester: 3,
    subjectCode: 'KCS301',
    subjectName: 'Data Structures',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/cse/KCS301-pyq-2024.pdf',
    academicYear: '2023-24',
    regulation: 'CBCS',
    description: 'Original AKTU university end-semester question paper with Section A, B, and C questions.',
    isPublished: true
  },

  // 2. CSE Year 2, Semester 4 - Operating Systems
  {
    title: 'Operating Systems Unit 1-5 Comprehensive Revision Notes',
    resourceType: 'Notes',
    branch: 'CSE',
    year: 2,
    semester: 4,
    subjectCode: 'KCS401',
    subjectName: 'Operating Systems',
    fileUrl: 'https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J-sampleOS/view?usp=sharing',
    academicYear: '2024-25',
    regulation: 'CBCS',
    description: 'Includes process scheduling algorithms, synchronization (semaphores, monitors), deadlock avoidance (Banker algorithm), memory management, and paging.',
    isPublished: true
  },
  {
    title: 'Operating Systems PYQ Collection (2020-2023 Solved)',
    resourceType: 'PYQ',
    branch: 'CSE',
    year: 2,
    semester: 4,
    subjectCode: 'KCS401',
    subjectName: 'Operating Systems',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/cse/KCS401-pyq-solved.pdf',
    academicYear: '2023-24',
    regulation: 'CBCS',
    description: '4-year question paper collection with solutions to repetitive numerical problems.',
    isPublished: true
  },

  // 3. CSE Year 3, Semester 5 - Database Management Systems
  {
    title: 'Database Management Systems (DBMS) Faculty Notes',
    resourceType: 'Notes',
    branch: 'CSE',
    year: 3,
    semester: 5,
    subjectCode: 'KCS501',
    subjectName: 'Database Management Systems',
    fileUrl: 'https://drive.google.com/file/d/1Z9Y8X7W6V5U4T3S2R1Q-sampleDBMS/view',
    academicYear: '2024-25',
    regulation: 'CBCS',
    description: 'Detailed coverage of ER Diagrams, Relational Algebra, SQL queries, Normalization (1NF to BCNF), and ACID transactions.',
    isPublished: true
  },
  {
    title: 'Database Management Systems End-Sem Paper 2023',
    resourceType: 'PYQ',
    branch: 'CSE',
    year: 3,
    semester: 5,
    subjectCode: 'KCS501',
    subjectName: 'Database Management Systems',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/cse/KCS501-pyq-2023.pdf',
    academicYear: '2022-23',
    regulation: 'CBCS',
    description: 'AKTU regular & carryover examination question paper with solution outlines.',
    isPublished: true
  },

  // 4. CSE Year 4, Semester 7 - Machine Learning
  {
    title: 'Machine Learning Semester Notes & Mathematical Derivations',
    resourceType: 'Notes',
    branch: 'CSE',
    year: 4,
    semester: 7,
    subjectCode: 'KCS071',
    subjectName: 'Machine Learning',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/cse/KCS071-ml-notes.pdf',
    academicYear: '2024-25',
    regulation: 'CBCS',
    description: 'Supervised vs unsupervised learning, Linear & Logistic Regression, Decision Trees, SVM, Ensemble methods, and Neural Networks.',
    isPublished: true
  },
  {
    title: 'Compiler Design Official Syllabus & PYQ Booklet',
    resourceType: 'PYQ',
    branch: 'CSE',
    year: 4,
    semester: 7,
    subjectCode: 'KCS701',
    subjectName: 'Compiler Design',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/cse/KCS701-pyq.pdf',
    academicYear: '2023-24',
    regulation: 'CBCS',
    description: 'Past 3 years solved question papers for Lexical Analysis, Parsing (LL, LR, LALR), Syntax Directed Translation, and Code Generation.',
    isPublished: true
  },

  // 5. IT Year 3, Semester 5 - Software Engineering
  {
    title: 'Software Engineering Complete Study Guide',
    resourceType: 'Notes',
    branch: 'IT',
    year: 3,
    semester: 5,
    subjectCode: 'KIT501',
    subjectName: 'Software Engineering',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/it/KIT501-notes.pdf',
    academicYear: '2024-25',
    regulation: 'CBCS',
    description: 'SDLC models, Agile Scrum, Software estimation (COCOMO), Testing methodologies (Black box, White box), and Quality management.',
    isPublished: true
  },

  // 6. ECE Year 2, Semester 3 - Digital Electronics
  {
    title: 'Digital Electronics Handcrafted Notes with Circuit Diagrams',
    resourceType: 'Notes',
    branch: 'ECE',
    year: 2,
    semester: 3,
    subjectCode: 'KEC301',
    subjectName: 'Digital Electronics',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/ece/KEC301-notes.pdf',
    academicYear: '2024-25',
    regulation: 'CBCS',
    description: 'Boolean algebra, K-Maps, combinational circuits, flip-flops, registers, counters, and ADC/DAC converters.',
    isPublished: true
  },
  {
    title: 'Digital Electronics Previous Year Question Paper 2024',
    resourceType: 'PYQ',
    branch: 'ECE',
    year: 2,
    semester: 3,
    subjectCode: 'KEC301',
    subjectName: 'Digital Electronics',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/ece/KEC301-pyq.pdf',
    academicYear: '2023-24',
    regulation: 'CBCS',
    description: 'AKTU university examination paper with detailed circuit-level questions.',
    isPublished: true
  },

  // 7. EE Year 2, Semester 4 - Electrical Machines
  {
    title: 'Electrical Machines-I Lecture Module',
    resourceType: 'Notes',
    branch: 'EE',
    year: 2,
    semester: 4,
    subjectCode: 'KEE401',
    subjectName: 'Electrical Machines',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/ee/KEE401-notes.pdf',
    academicYear: '2024-25',
    regulation: 'CBCS',
    description: 'Single-phase and three-phase transformers, DC generators and DC motors, testing methods and efficiency calculations.',
    isPublished: true
  },

  // 8. ME Year 2, Semester 3 - Thermodynamics
  {
    title: 'Thermodynamics Fundamental Concepts & Formula Sheet',
    resourceType: 'Notes',
    branch: 'ME',
    year: 2,
    semester: 3,
    subjectCode: 'KME301',
    subjectName: 'Thermodynamics',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/me/KME301-notes.pdf',
    academicYear: '2024-25',
    regulation: 'CBCS',
    description: 'First and Second Laws of Thermodynamics, Carnot theorem, Entropy, Exergy, and Vapor Power Cycles with step-by-step numerical examples.',
    isPublished: true
  },

  // 9. Civil Year 2, Semester 3 - Building Materials
  {
    title: 'Building Materials & Construction Technology Notes',
    resourceType: 'Notes',
    branch: 'Civil',
    year: 2,
    semester: 3,
    subjectCode: 'KCE301',
    subjectName: 'Building Materials',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/civil/KCE301-notes.pdf',
    academicYear: '2024-25',
    regulation: 'CBCS',
    description: 'Properties, testing and manufacturing of cement, concrete, mortar, bricks, stones, and modern construction composites.',
    isPublished: true
  },

  // 10. Common 1st Year (Semester 1) - Engineering Mathematics-I
  {
    title: 'Engineering Mathematics-I Complete Formulae & Solved Problems',
    resourceType: 'Notes',
    branch: 'CSE',
    year: 1,
    semester: 1,
    subjectCode: 'BAS103',
    subjectName: 'Engineering Mathematics-I',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/common/BAS103-maths1-notes.pdf',
    academicYear: '2024-25',
    regulation: 'K-Series',
    description: 'Matrices & Eigenvalues, Differential Calculus (Rolle theorem, Taylor theorem), Multivariable calculus, Vector calculus, and Multiple integrals.',
    isPublished: true
  },
  {
    title: 'Engineering Mathematics-I Previous Year Question Paper 2024',
    resourceType: 'PYQ',
    branch: 'CSE',
    year: 1,
    semester: 1,
    subjectCode: 'BAS103',
    subjectName: 'Engineering Mathematics-I',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/common/BAS103-pyq.pdf',
    academicYear: '2023-24',
    regulation: 'K-Series',
    description: 'AKTU 1st year common end-term question paper with step-by-step marking rubrics.',
    isPublished: true
  },

  // 11. An Unpublished Sample Draft (for admin verification)
  {
    title: 'Draft: Emerging Technologies and Quantum Computing Seminar Paper',
    resourceType: 'Notes',
    branch: 'CSE',
    year: 4,
    semester: 8,
    subjectCode: 'KOE088',
    subjectName: 'Emerging Technologies',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/drafts/KOE088-draft.pdf',
    academicYear: '2024-25',
    regulation: 'CBCS',
    description: 'Internal draft awaiting faculty review before public publishing.',
    isPublished: false
  }
];

const seed = async () => {
  try {
    await connectDB();
    console.log('[Seed] Seeding sample AKTU academic resources...');

    let inserted = 0;
    let skipped = 0;

    for (const item of sampleResources) {
      const exists = await Resource.findOne({
        subjectCode: item.subjectCode,
        resourceType: item.resourceType,
        semester: item.semester,
        academicYear: item.academicYear,
        regulation: item.regulation
      });

      if (!exists) {
        await Resource.create(item);
        inserted++;
      } else {
        skipped++;
      }
    }

    console.log(`[Seed] Finished! Inserted: ${inserted}, Skipped (already exists): ${skipped}`);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err.message);
  } finally {
    await disconnectDB();
  }
};

seed();

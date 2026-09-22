let editingStudentId = null;


// ============================================
// LOAD DASHBOARD
// ============================================

async function loadDashboard() {

    const tableBody =
        document.getElementById("students-table-body");

    try {

        const students = await getStudents();

        const totalStudents = students.length;

        const maleStudents =
            students.filter(
                student =>
                    student.gender.toLowerCase() === "male"
            ).length;

        const femaleStudents =
            students.filter(
                student =>
                    student.gender.toLowerCase() === "female"
            ).length;


        // ========================================
        // MAIN DASHBOARD STATISTICS
        // ========================================

        document.getElementById(
            "total-students"
        ).textContent = totalStudents;


        document.getElementById(
            "male-students"
        ).textContent = maleStudents;


        document.getElementById(
            "female-students"
        ).textContent = femaleStudents;



        // ========================================
        // ANALYTICS STATISTICS
        // ========================================

        document.getElementById(
            "analytics-total"
        ).textContent = totalStudents;


        document.getElementById(
            "analytics-male"
        ).textContent = maleStudents;


        document.getElementById(
            "analytics-female"
        ).textContent = femaleStudents;



        // ========================================
        // STUDENT TABLE
        // ========================================

        tableBody.innerHTML = "";


        if (students.length === 0) {

            const row =
                document.createElement("tr");

            const cell =
                document.createElement("td");

            cell.colSpan = 6;

            cell.className = "empty-state";

            cell.textContent =
                "No students found.";

            row.appendChild(cell);

            tableBody.appendChild(row);

            return;
        }


        students.forEach(student => {

            const row =
                document.createElement("tr");


            // Name
            const nameCell =
                document.createElement("td");

            nameCell.textContent =
                student.name;


            // Age
            const ageCell =
                document.createElement("td");

            ageCell.textContent =
                student.age;


            // Gender
            const genderCell =
                document.createElement("td");

            genderCell.textContent =
                student.gender;


            // Course
            const courseCell =
                document.createElement("td");

            courseCell.textContent =
                student.course;


            // Email
            const emailCell =
                document.createElement("td");

            emailCell.textContent =
                student.email;


            // Actions
            const actionsCell =
                document.createElement("td");


            const editButton =
                document.createElement("button");

            editButton.textContent =
                "Edit";

            editButton.className =
                "secondary-btn";


            editButton.addEventListener(
                "click",
                () => editStudent(student)
            );


            const deleteButton =
                document.createElement("button");

            deleteButton.textContent =
                "Delete";

            deleteButton.className =
                "danger-btn";


            deleteButton.addEventListener(
                "click",
                () => removeStudent(student.id)
            );


            actionsCell.appendChild(editButton);

            actionsCell.appendChild(deleteButton);


            row.appendChild(nameCell);

            row.appendChild(ageCell);

            row.appendChild(genderCell);

            row.appendChild(courseCell);

            row.appendChild(emailCell);

            row.appendChild(actionsCell);


            tableBody.appendChild(row);

        });


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );


        tableBody.innerHTML = "";


        const row =
            document.createElement("tr");


        const cell =
            document.createElement("td");

        cell.colSpan = 6;

        cell.className = "empty-state";

        cell.textContent =
            "Failed to load students.";


        row.appendChild(cell);

        tableBody.appendChild(row);

    }
}



// ============================================
// OPEN ADD STUDENT FORM
// ============================================

function openAddStudentForm() {

    editingStudentId = null;


    const formSection =
        document.getElementById(
            "student-form-section"
        );


    const form =
        document.getElementById(
            "student-form"
        );


    form.reset();


    formSection.hidden = false;


    formSection.scrollIntoView({
        behavior: "smooth"
    });

}



// ============================================
// EDIT STUDENT
// ============================================

function editStudent(student) {

    editingStudentId =
        student.id;


    document.getElementById(
        "student-name"
    ).value = student.name;


    document.getElementById(
        "student-age"
    ).value = student.age;


    document.getElementById(
        "student-gender"
    ).value = student.gender;


    document.getElementById(
        "student-course"
    ).value = student.course;


    document.getElementById(
        "student-email"
    ).value = student.email;


    const formSection =
        document.getElementById(
            "student-form-section"
        );


    formSection.hidden = false;


    formSection.scrollIntoView({
        behavior: "smooth"
    });

}



// ============================================
// DELETE STUDENT
// ============================================

async function removeStudent(studentId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this student?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteStudent(studentId);


        await loadDashboard();


    } catch (error) {

        console.error(
            "Delete student error:",
            error
        );


        alert(
            error.message
        );

    }

}



// ============================================
// STUDENT FORM
// ============================================

function setupStudentForm() {

    const form =
        document.getElementById(
            "student-form"
        );


    const cancelButton =
        document.getElementById(
            "cancel-student-btn"
        );


    const addButton =
        document.getElementById(
            "add-student-btn"
        );


    // ========================================
    // ADD STUDENT BUTTON
    // ========================================

    addButton.addEventListener(
        "click",
        openAddStudentForm
    );


    // ========================================
    // CANCEL BUTTON
    // ========================================

    cancelButton.addEventListener(
        "click",
        () => {

            editingStudentId = null;

            form.reset();

            document.getElementById(
                "student-form-section"
            ).hidden = true;

        }
    );


    // ========================================
    // FORM SUBMISSION
    // ========================================

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const studentData = {

                name:
                    document.getElementById(
                        "student-name"
                    ).value.trim(),

                age:
                    Number(
                        document.getElementById(
                            "student-age"
                        ).value
                    ),

                gender:
                    document.getElementById(
                        "student-gender"
                    ).value,

                course:
                    document.getElementById(
                        "student-course"
                    ).value.trim(),

                email:
                    document.getElementById(
                        "student-email"
                    ).value.trim()

            };


            try {

                if (editingStudentId === null) {

                    await createStudent(
                        studentData
                    );

                } else {

                    await updateStudent(
                        editingStudentId,
                        studentData
                    );

                }


                editingStudentId = null;


                form.reset();


                document.getElementById(
                    "student-form-section"
                ).hidden = true;


                await loadDashboard();


            } catch (error) {

                console.error(
                    "Student form error:",
                    error
                );


                alert(
                    error.message
                );

            }

        }
    );

}



// ============================================
// AI ASSISTANT
// ============================================

function setupChat() {

    const chatForm =
        document.getElementById(
            "chat-form"
        );


    const questionInput =
        document.getElementById(
            "chat-question"
        );


    const submitButton =
        document.getElementById(
            "chat-submit-btn"
        );


    const responseBox =
        document.getElementById(
            "chat-response"
        );


    const answerElement =
        document.getElementById(
            "chat-answer"
        );


    // ========================================
    // CHAT FORM SUBMISSION
    // ========================================

    chatForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const question =
                questionInput.value.trim();


            if (!question) {

                return;

            }


            // ====================================
            // LOADING STATE
            // ====================================

            submitButton.disabled = true;

            submitButton.textContent =
                "Thinking...";


            responseBox.hidden = false;


            answerElement.textContent =
                "AI is processing your question...";


            try {

                const result =
                    await askAI(question);


                answerElement.textContent =
                    result.answer;


            } catch (error) {

                console.error(
                    "AI chat error:",
                    error
                );


                answerElement.textContent =
                    "Sorry, I could not process your question. "
                    + error.message;

            } finally {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Ask AI";

            }

        }
    );


    // ========================================
    // EXAMPLE QUESTIONS
    // ========================================

    const examples =
        document.querySelectorAll(
            ".example-questions span"
        );


    examples.forEach(example => {

        example.addEventListener(
            "click",
            () => {

                questionInput.value =
                    example.textContent.trim();


                questionInput.focus();

            }
        );

    });

}



// ============================================
// INITIALIZE APPLICATION
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDashboard();

        setupStudentForm();

        setupChat();

    }
);
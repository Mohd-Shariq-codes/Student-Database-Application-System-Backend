const API_BASE_URL = "http://127.0.0.1:8000";


// ============================================
// GET ALL STUDENTS
// ============================================

async function getStudents() {

    const response = await fetch(
        `${API_BASE_URL}/students`
    );


    if (!response.ok) {

        throw new Error(
            "Failed to fetch students"
        );

    }


    return await response.json();
}



// ============================================
// CREATE STUDENT
// ============================================

async function createStudent(studentData) {

    const response = await fetch(
        `${API_BASE_URL}/students`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(studentData)
        }
    );


    if (!response.ok) {

        let message = "Failed to create student";


        try {

            const errorData =
                await response.json();


            if (errorData.detail) {

                if (Array.isArray(errorData.detail)) {

                    message =
                        errorData.detail
                            .map(error => error.msg)
                            .join(", ");

                } else {

                    message =
                        errorData.detail;

                }

            }

        } catch (error) {

            console.error(
                "Error reading API error response:",
                error
            );

        }


        throw new Error(message);

    }


    return await response.json();
}



// ============================================
// UPDATE STUDENT
// ============================================

async function updateStudent(
    studentId,
    studentData
) {

    const response = await fetch(
        `${API_BASE_URL}/students/${studentId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(studentData)
        }
    );


    if (!response.ok) {

        let message =
            "Failed to update student";


        try {

            const errorData =
                await response.json();


            if (errorData.detail) {

                if (Array.isArray(errorData.detail)) {

                    message =
                        errorData.detail
                            .map(error => error.msg)
                            .join(", ");

                } else {

                    message =
                        errorData.detail;

                }

            }

        } catch (error) {

            console.error(
                "Error reading API error response:",
                error
            );

        }


        throw new Error(message);

    }


    return await response.json();
}



// ============================================
// DELETE STUDENT
// ============================================

async function deleteStudent(studentId) {

    const response = await fetch(
        `${API_BASE_URL}/students/${studentId}`,
        {
            method: "DELETE"
        }
    );


    if (!response.ok) {

        let message =
            "Failed to delete student";


        try {

            const errorData =
                await response.json();


            if (errorData.detail) {

                message =
                    errorData.detail;

            }

        } catch (error) {

            console.error(
                "Error reading API error response:",
                error
            );

        }


        throw new Error(message);

    }


    return await response.json();
}



// ============================================
// AI CHAT
// ============================================

async function askAI(question) {

    const response = await fetch(
        `${API_BASE_URL}/chat`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question
            })
        }
    );


    if (!response.ok) {

        let message =
            "Failed to get AI response";


        try {

            const errorData =
                await response.json();


            if (errorData.detail) {

                if (Array.isArray(errorData.detail)) {

                    message =
                        errorData.detail
                            .map(error => error.msg)
                            .join(", ");

                } else {

                    message =
                        errorData.detail;

                }

            }

        } catch (error) {

            console.error(
                "Error reading AI error response:",
                error
            );

        }


        throw new Error(message);

    }


    return await response.json();
}
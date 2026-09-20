const API_URL = "https://quicknotes-api-0ebf.onrender.com";
const noteForm = document.getElementById("noteForm");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const notesContainer = document.getElementById("notesContainer");
const noteCount = document.getElementById("noteCount");
const submitBtn = document.getElementById("submitBtn");
const statusMessage = document.getElementById("status");

// ====================================
// GET - Fetch all notes
// ====================================

async function fetchNotes() {
    statusMessage.textContent = "Loading notes...";

    try {
        const response = await fetch(`${API_URL}/notes`);

        if (!response.ok) {
            throw new Error("Failed to fetch notes");
        }

        const notes = await response.json();

        displayNotes(notes);

        statusMessage.textContent = "";
    } catch (error) {
        console.error(error);

        statusMessage.textContent =
            "Unable to load notes. Please check your server.";
    }
}

// ====================================
// Display notes on the webpage
// ====================================

function displayNotes(notes) {
    notesContainer.replaceChildren();

    noteCount.textContent =
        `${notes.length} ${notes.length === 1 ? "note" : "notes"}`;

    if (notes.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";

        const heading = document.createElement("h3");
        heading.textContent = "No notes yet";

        const description = document.createElement("p");
        description.textContent =
            "Your ideas deserve a home. Create your first note above.";

        emptyState.append(heading, description);
        notesContainer.appendChild(emptyState);

        return;
    }

    notes.forEach(note => {
        const card = document.createElement("article");
        card.className = "note-card";

        const heading = document.createElement("h3");
        heading.textContent = note.title;

        const content = document.createElement("p");
        content.textContent = note.content;

        const footer = document.createElement("div");
        footer.className = "note-card-footer";

        const date = document.createElement("span");
        date.className = "note-date";

        date.textContent = new Date(
            note.createdAt
        ).toLocaleDateString();

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteNote(note._id);
        });

        footer.append(date, deleteButton);

        card.append(heading, content, footer);

        notesContainer.appendChild(card);
    });
}

// ====================================
// POST - Create a new note
// ====================================

noteForm.addEventListener("submit", async event => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
        statusMessage.textContent =
            "Please enter both a title and content.";
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title,
                content
            })
        });

        if (!response.ok) {
            throw new Error("Failed to create note");
        }

        noteForm.reset();

        await fetchNotes();

    } catch (error) {
        console.error(error);

        statusMessage.textContent =
            "Unable to save note. Please try again.";

    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "+ Add Note";
    }
});

// ====================================
// DELETE - Delete a note
// ====================================

async function deleteNote(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/notes/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete note");
        }

        await fetchNotes();

    } catch (error) {
        console.error(error);

        statusMessage.textContent =
            "Unable to delete note. Please try again.";
    }
}

// ====================================
// Initialize application
// ====================================

fetchNotes();
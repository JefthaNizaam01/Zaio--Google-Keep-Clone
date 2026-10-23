const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title");
const noteInput = document.getElementById("note");
const noteList = document.getElementById("note-list-result");
const emptyMessage = document.getElementById("empty-message");
const listHeading = document.getElementById("list-heading");
const searchInput = document.getElementById("search");
const editDialog = document.getElementById("edit-dialog");
const editNoteForm = document.getElementById("edit-note-form");
const editTitleInput = document.getElementById("edit-title");
const editTextInput = document.getElementById("edit-note");



// Load saved notes when the page opens
let notes = JSON.parse(localStorage.getItem("keep-notes")) || [];
let showingArchived = false;
let noteBeingEdited = null;


function saveNotes() {
    localStorage.setItem("keep-notes", JSON.stringify(notes));
}


// Clear the form after adding a note
function clearInput() {
    titleInput.value = "";
    noteInput.value = "";
}

function openNoteEditor(note) {
   
    noteBeingEdited = note;
    editTitleInput.value = note.title;
    editTextInput.value = note.text;
    editDialog.showModal();
    editTitleInput.focus();
}

function showNotes() {
    const searchText = searchInput.value.toLowerCase();
    
    const shownNotes = notes.filter(function (note) {
        const matchesSection = note.archived === showingArchived;
        const matchesSearch = note.title.toLowerCase().includes(searchText)
            || note.text.toLowerCase().includes(searchText);
        return matchesSection && matchesSearch;
    });

    noteList.innerHTML = "";
    listHeading.textContent = showingArchived ? "Archive" : "All notes";
    emptyMessage.hidden = shownNotes.length > 0;
    emptyMessage.textContent = searchText ? "No notes found." : "Your notes will show up here.";

    shownNotes.forEach(function (note) {
        const noteCard = document.createElement("article");
        const noteContentButton = document.createElement("button");
        const noteTitle = document.createElement("h3");
        const noteText = document.createElement("p");
        const archiveButton = document.createElement("button");

        noteCard.className = "note-card";
        noteContentButton.className = "note-card-content";
        noteContentButton.type = "button";
        noteContentButton.setAttribute("aria-label", `Edit note: ${note.title || "Untitled"}`);
        noteTitle.textContent = note.title || "Untitled";
        noteText.textContent = note.text;
        noteContentButton.addEventListener("click", function () {
            openNoteEditor(note);
        });
        archiveButton.className = "text-button";
        archiveButton.type = "button";
        archiveButton.textContent = showingArchived ? "Unarchive" : "Archive";
        archiveButton.title = showingArchived ? "Move note to all notes" : "Move note to archive";
        archiveButton.addEventListener("click", function () {
            note.archived = !note.archived;
            saveNotes();
            showNotes();
        });

        noteContentButton.appendChild(noteTitle);
        noteContentButton.appendChild(noteText);
        noteCard.appendChild(noteContentButton);
        noteCard.appendChild(archiveButton);
        noteList.appendChild(noteCard);
    });
}

editNoteForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!noteBeingEdited) {
        return;
    }

    noteBeingEdited.title = editTitleInput.value.trim();
    noteBeingEdited.text = editTextInput.value.trim();
    saveNotes();
    noteBeingEdited = null;
    editDialog.close();
    showNotes();
});

editDialog.addEventListener("close", function () {
    noteBeingEdited = null;
});

document.getElementById("cancel-edit-button").addEventListener("click", function () {
    editDialog.close();
});

noteForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const text = noteInput.value.trim();

    if (!title && !text) {
        noteInput.focus();
        return;
    }

    notes.unshift({
        title: title,
        text: text,
        archived: false
    });

    saveNotes();
    clearInput();
    showingArchived = false;
    document.getElementById("all-notes-button").classList.add("active");
    document.getElementById("archive-button").classList.remove("active");
    showNotes();
});

document.getElementById("clear-button").addEventListener("click", clearInput);
document.getElementById("all-notes-button").addEventListener("click", function () {
    showingArchived = false;
    this.classList.add("active");
    document.getElementById("archive-button").classList.remove("active");
    showNotes();
});
document.getElementById("archive-button").addEventListener("click", function () {
    showingArchived = true;
    this.classList.add("active");
    document.getElementById("all-notes-button").classList.remove("active");
    showNotes();
});
searchInput.addEventListener("input", showNotes);
document.getElementById("refresh-button").addEventListener("click", showNotes);
document.getElementById("layout-button").addEventListener("click", function () {
    const isListView = noteList.classList.toggle("list-view");
    this.setAttribute("aria-pressed", String(isListView));
});
document.getElementById("menu-button").addEventListener("click", function () {
    document.getElementById("sidebar").classList.toggle("sidebar-hidden");
});

showNotes();

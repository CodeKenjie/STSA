const currentUserId = getCurrentUser();
const ACTIVE_LIMIT = 1 * 60 * 1000;

function parseJwt(token) {
    if (!token) return null;
    const base64Url = token.split('.')[1]; // get payload
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
}

function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const decoded = parseJwt(token);
  return decoded.userId;
}

function showHide(id, type){
    const img = document.getElementById(id);
    const pass = document.getElementById(type);

    if (img.src.match("css/imgs/show.png")){
        pass.type = "text";
        img.src = "css/imgs/hide.png";
    } else {
        pass.type = "password";
        img.src = "css/imgs/show.png";
    }
}


function logout(event){
    event.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

async function renderList({ data, containerId, renderItem }){
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    data.forEach(item => {
        const list = document.createElement("li");

        renderItem(list, item);
        container.appendChild(list);
    });
}

async function deleteItem(id){
    try{
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:3000/delete/${id._id}`, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token
            }
        });
    } catch (err){
        console.error(err);
    }
}

async function loadUserTask(){
    try{
        const token = localStorage.getItem("token");
        const res = await fetch ("http://localhost:3000/loadUser", {
            method: "GET",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const { userTodo, userSched, userModule } = await res.json();

        renderList({
            data: userTodo,
            containerId: "todoList",
            renderItem: (list, todo) => {
                const input = document.createElement("input");
                input.type = "checkbox";
                input.checked = todo.completed;

                const label = document.createElement("label");
                label.textContent = todo.title;
                label.style.opacity = input.checked ? "50%" : "100%";

                const p = document.createElement("p");
                p.textContent = new Date(todo.due).toLocaleString();
                const button = document.createElement("button");
                button.textContent = "-";

                button.addEventListener("click", async (e)=> {
                    e.preventDefault();
                    deleteItem(todo);
                    list.remove();
                });

                input.addEventListener("change", async () => {
                    label.style.opacity = input.checked ? "50%" : "100%";
                    try {
                        const token = localStorage.getItem("token");
                        await fetch(`http://localhost:3000/completed/${todo._id}`, {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: "Bearer " + token
                            },
                            body: JSON.stringify({ completed: input.checked })
                        });
                    } catch (err) {
                        console.error(err);
                    }
                });
                list.append(input, label, p, button);
            }
        });

        renderList({
            data: userSched,
            containerId: "schedList",
            renderItem: (list, subject) => {
                const label = document.createElement("label");
                label.textContent = subject.title;
                const p = document.createElement("p");
                p.textContent = subject.day + " " + subject.from + " - " + subject.to;
                const button = document.createElement("button");
                button.textContent = "-";

                button.addEventListener("click", async (e)=> {
                    e.preventDefault();
                    deleteItem(subject);
                    list.remove();
                });

                list.append(label, p, button);
            }
        });

        renderList({
            data: userModule,
            containerId: "moduleList",
            renderItem: (list, link) => {
                const a = document.createElement("a");
                a.textContent = link.title;
                a.href = "#";
                const button = document.createElement("button");
                button.textContent = "-";

                button.addEventListener("click", async (e)=> {
                    e.preventDefault();
                    deleteItem(link);
                    list.remove();
                });

                a.addEventListener("click", () => {
                    const iframeContainer = document.getElementById("Container");
                    iframeContainer.innerHTML = '';
                    iframeContainer.style.display = "flex";

                    const iframe = document.createElement("iframe");
                    const close = document.createElement("button");
                    close.textContent = "x";
                    iframe.src = link.link;
                    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                    iframe.allowFullscreen = true;

                    iframeContainer.append(close, iframe);
                    close.addEventListener("click", (e) => {
                        e.preventDefault();
                        iframeContainer.style.display = "none";
                    });
                });

                list.append(a, button);
            }
        });
    } catch (err) {
        console.error(err);
    }
};

async function loadMessages(class_id) {
    try{
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3000/classes/${class_id}/loadMessages`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const { classAnnouncements } = await res.json();

        if(!res.ok){
            console.error("failed to load messages");
        }

        renderList({
            data: classAnnouncements,
            containerId: "messages",
            renderItem: (list, message) => {
                const span = document.createElement("span");
                const label = document.createElement("label");
                label.textContent = message.user
                const img = document.createElement("img");
                img.src = message.avatar;
                const email = document.createElement("p");
                email.textContent = message.email;
                const p = document.createElement("p");
                p.textContent = message.message;
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "-";
                const editBtn = document.createElement("button");
                editBtn.textContent = "edit";
                const saveBtn = document.createElement("button");
                saveBtn.textContent = "save";
                saveBtn.className = "listBtns";
                saveBtn.type = "button";
                const cancelBtn = document.createElement("button");
                cancelBtn.textContent = "cancel";
                cancelBtn.className = "listBtns";
                cancelBtn.type = "button";

                label.append(email);
                span.append(img, label);
                list.append(span, p);

                if (message.sender === currentUserId) {
                    span.append(editBtn, deleteBtn);
                }

                deleteBtn.addEventListener("click", async (e) => {
                    e.preventDefault();
                    deleteMessage(message);
                    list.remove();
                });

                editBtn.addEventListener("click", async (e) => {
                    e.preventDefault();
                    const textArea = document.createElement("textarea");
                    textArea.value = message.message;
                    p.replaceWith(textArea);
                    list.append(saveBtn, cancelBtn);

                    saveBtn.addEventListener("click", async(e) => {
                        e.preventDefault();
                        editMessage(message, textArea);
                    });

                    cancelBtn.addEventListener("click", (e) => {
                        loadMessages(activeClass);
                    });
                });
            }
        });
    } catch (err) {
        console.error(err);
    }
}

function UserActive(user) {
    return Date.now() - new Date(user.lastActive).getTime() < ACTIVE_LIMIT;
}

let activeClass = null;
async function loadClasses(){
    try{
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3000/loadUser`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const { userClasses } = await res.json();
 
        const classesList = document.getElementById("classList");
        userClasses.forEach(joined => {
            const button = document.createElement("button");
            button.textContent = joined.class_name;
            button.type = "button";
            const leave = document.createElement("button");
            leave.textContent = "-";
            leave.className = "leaveClass";
            leave.type = "button";

            button.append(leave);

            leave.addEventListener("click", (e) => {
                e.preventDefault();
                leaveClass();
                button.remove();
            });

            classesList.appendChild(button);
            button.addEventListener("click", (e) => {
                e.preventDefault();
                button.classList.add("active");
                activeClass = joined._id;
                loadMessages(joined._id);
                document.getElementById("class_id").value = joined._id;
            });
        });
    } catch (err) {
        console.error(err);
    }
}

async function leaveClass(){
    try{
        const token = localStorage.getItem("token");
        const res = await fetch (`http://localhost:3000/classes/${activeClass}/leaveClass`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            }
        });

        if (!res.ok) {
            res.error = "Class not found"; 
        }

        const data = await res.json();
        console.log(data);
    } catch (err) {
        console.error(err);
    }
    loadClasses();
}

async function deleteMessage(messageid){
    try{
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:3000/classes/${activeClass}/deleteMessage/${messageid._id}`, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token
            }
        });
    } catch (err) {
        console.error(err);
    }
}

async function editMessage(messageid, newMessage){
    try{
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:3000/classes/${activeClass}/editMessage/${messageid._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ message: newMessage.value })
        });
    } catch(err) {
        console.error(err);
    }
    const messages = document.getElementById("messages");
    messages.innerHTML = "";
    loadMessages(activeClass);
}

document.addEventListener("DOMContentLoaded", function(e){
    e.preventDefault();
    const login = document.getElementById("login");
    const token = localStorage.getItem("token");
    const pages = ["/index.html", "/profile.html", "/verify.html"];
    const currentpage = window.location.pathname;
    if (pages.includes(currentpage) && !token){
        window.location.href = "mainpage.html";
    }

    if (login){
        document.getElementById("userNotRegistered").classList.add("hidden");
        document.getElementById("incorrectPassword").classList.add("hidden");

        const form = document.getElementById('loginForm');
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const user = document.getElementById('User').value;
            const password = document.getElementById('Password').value;

            try{
                const response = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ user, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem("token", data.token);
                    currentUser = data._id;
                    window.location.href = "index.html";
                } else {
                    if (data.error === "User not found") {
                        document.getElementById("userNotRegistered").classList.remove("hidden");
                    } else {
                        document.getElementById("userNotRegistered").classList.add("hidden");
                        document.getElementById("incorrectPassword").classList.remove("hidden");
                    }
                }
            } catch(err) {
                console.error(err);
            }
        });    
    }

    const index = document.getElementById("stsa");
    if (index) {
        loadUserTask();
        loadClasses();
        const menu = document.querySelector(".menubar");
        const sidebar = document.querySelector(".sidebar");
        menu.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            menu.classList.toggle("open");
        });

        const bell = document.querySelector(".icon");
        const ibell = document.querySelector(".icon img");
        const notif = document.querySelector(".notif");
        const close = document.querySelector(".close");

        bell.addEventListener("click", () => {
            notif.classList.toggle("open");
            ibell.classList.toggle("close");
            close.classList.toggle("open");
        });

        const addClass = document.querySelector(".addDropDown");
        const jClass = document.querySelector(".joinClass");
        addClass.addEventListener("click", () => {
            jClass.classList.toggle("open");
        });

        const profile = document.getElementById("sidebar");
        if (profile) {
            const profilePic = document.getElementById("profilePic");
            const name = document.getElementById("username");
            const email = document.getElementById("email");
            const course = document.getElementById("course");
            const verification = document.getElementById("verification");

            async function getUser() {
                const token = localStorage.getItem("token");

                if(!token) {
                    console.log("No token found. Please Login first");
                    return;
                }

                try{
                    const res = await fetch("http://localhost:3000/loadUser", {
                        headers: {
                            Authorization: "Bearer " + token
                        }
                    });

                    if (!res.ok) {
                        name.textContent = "Please log in";
                    }

                    const { user } = await res.json();

                    profilePic.src = user.avatar;
                    name.textContent = user.username;
                    email.textContent = user.email;
                    course.textContent = user.course;
                    if(user.verified){
                        verification.textContent = "verified";
                        verification.style.color = "green";
                    } else {
                        verification.textContent = "not verified";
                        verification.style.color = "red";
                    }
                } catch (err) {
                    console.error(err);
                }  
            }
            getUser();
        }

        const inputTodo = document.getElementById("addTodo");
        inputTodo.addEventListener("submit", async (e) => {
            e.preventDefault();
            const inputLabel = document.getElementById("todo_title");
            const inputDate = document.getElementById("todoDate");

            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:3000/addTask", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        Authorization: "Bearer " + token,
                    },
                    body: JSON.stringify({ title: inputLabel.value, due: inputDate.value })
                });

                const data = await res.json();
                console.log(data);
            } catch (err) {
                console.log(err);
            }
            const list = document.getElementById("todoList");
            list.innerHTML = "";
            inputLabel.value = "";
            inputDate.value = "";
            loadUserTask();
        });

        const inputSched = document.getElementById("addSched");
        inputSched.addEventListener("submit", async (e) => {
            e.preventDefault();
            const subject = document.getElementById("subject");
            const day = document.getElementById("days");
            const from = document.getElementById("from");
            const to = document.getElementById("to");
            try{
                const token = localStorage.getItem("token");

                const res = await fetch("http://localhost:3000/addSched", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token
                    },
                    body: JSON.stringify({ title: subject.value, day: day.value, from: from.value, to: to.value })
                });

                const data = await res.json();
                console.log(data);
            } catch(err) {
                console.error(err);
            }

            const list = document.getElementById("schedList");
            list.innerHTML = "";
            subject.value = "";
            day.value = "";
            from.value = "";
            to.value = "";

            loadUserTask();
        });

        const inputModule = document.getElementById("addModule");
        inputModule.addEventListener("submit", async (e) => {
            e.preventDefault();
            const title = document.getElementById("moduleTitle");
            const link = document.getElementById("link");
            try {
                const token = localStorage.getItem("token");
                const res = await fetch ("http://localhost:3000/addModule", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token
                    },
                    body: JSON.stringify({ title: title.value, link: link.value })
                });

                const data = await res.json();
                console.log(data);
                this.location.reload();
            } catch (err) {
                console.error(err);
            }
            
            const list = document.getElementById("moduleList");
            list.innerHTML = "";
            title.value = "";
            link.value = "";
            loadUserTask();
        });

        const createClass = document.getElementById("createClass");
        createClass.addEventListener("click", async (e) => {
            e.preventDefault();
            const className = document.getElementById("className");
            try{
                const token = localStorage.getItem("token");
                const res = await fetch(`http://localhost:3000/createClass`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token
                    },
                    body: JSON.stringify({ class_name: className.value })
                });

                const data = await res.json();
                console.log(data);
            } catch (err) {
                console.error(err);
            }
            className.value = "";
        });

        const joinClass = document.getElementById("joinClass");
        joinClass.addEventListener("click", async (e) => {
            e.preventDefault();
            const getClassId = document.getElementById("classId");
            try{
                const token = localStorage.getItem("token");
                const res = await fetch(`http://localhost:3000/classes/${getClassId.value}/joinClass`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token
                    }
                });

                const data = await res.json();
                console.log(data);
            } catch (err) {
                console.error(err);
            }
            getClassId.value = "";
            loadClasses();
        });

        const send = document.getElementById("sendAnnouncement");
        send.addEventListener("submit", async (e) => {
            e.preventDefault();
            const message = document.getElementById("message");
            message.addEventListener("input", () => {
                message.style.height = "auto";
                message.style.height = message.scrollHeight + "px";
            })
            if(!activeClass) {
                return message.value = "no Active class";
            }
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`http://localhost:3000/classes/${activeClass}/sendMessage`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token
                    },
                    body: JSON.stringify({ message: message.value })
                });
                if (!res.ok) {
                    console.log(" front-end cant respond error");
                }
                const data = await res.json();
                console.log(data);
            } catch (err) {
                console.error(err);
            }
            message.value = "";
            loadMessages(activeClass);
        });

    }

    const profile = document.getElementById("profile");
    if (profile) {
        const coverPhoto = document.getElementById("coverPhoto");
        const save = document.getElementById("save");
        const cancel = document.getElementById("cancel");
        const upload = document.getElementById("uploads");
        const cameradd = document.getElementById("cameradd");
        const profilePic = document.getElementById("profilePic");
        save.classList.add("hidden");
        cancel.classList.add("hidden");
        upload.classList.add("hidden");
        cameradd.classList.add("hidden");
        const info = document.getElementById("info");

        if (info) {
            const name = document.getElementById("username");
            const birthdate = document.getElementById("birthdate");
            const email = document.getElementById("email");
            const school = document.getElementById("school");
            const year = document.getElementById("year");
            const course = document.getElementById("course");
            const verification = document.getElementById("verification");

            async function getUser() {
                const token = localStorage.getItem("token");

                if(!token){
                    console.log("No token found. Please Login first");
                    return;
                }

                try {
                    const res = await fetch("http://localhost:3000/loadUser", {
                        headers: {
                            Authorization: "Bearer " + token
                        }
                    });

                    if (!res.ok) {
                        name.textContent = "Please log in";
                    }

                    const data = await res.json();
                    const user = data.user;

                    coverPhoto.src = user.cover;
                    profilePic.src = user.avatar;
                    name.textContent = user.username;
                    email.textContent = user.email;
                    birthdate.textContent = user.birthdate;
                    email.textContent = user.email;
                    school.textContent = user.school;
                    year.textContent = user.year;
                    course.textContent = user.course;

                    if(user.verified){
                        verification.textContent = "verified";
                        verification.style.color = "green";
                    } else {
                        verification.textContent = "not verified";
                        verification.style.color = "red";
                    }
                    
                } catch (err) {
                    console.error(err);
                }
            }
            getUser();

            const edit = document.getElementById("edit");
            edit.addEventListener("click", (e) => {
                e.preventDefault();
                document.querySelectorAll(".infoBox li").forEach(li => {
                    const value = li.innerText;

                    const input = document.createElement("input");

                    input.value = value;
                    input.classList.add("editInput");

                    if (li.id) input.id = li.id;

                    li.replaceWith(input);
                });

                const date = document.querySelector("#birthdate");
                const bd = document.createElement("input");
                const value = birthdate.innerText;
                bd.type = "date";
                bd.value = value;
                bd.classList.add("editInput");
                bd.id = "birthdate";
                date.replaceWith(bd);

                const labels = document.querySelectorAll(".label");
                labels.forEach(label => {
                    label.classList.toggle("ledit");
                });


                document.getElementById("lverify").classList.add("hidden");
                verification.classList.add("hidden");
                edit.classList.add("hidden");
                save.classList.remove("hidden");
                cancel.classList.remove("hidden");
                upload.classList.remove("hidden");
                cameradd.classList.remove("hidden");
            });

            const save = document.getElementById("save");
            save.addEventListener("click", async (e) => {
                e.preventDefault();
                const updateName = document.querySelector("#username").value;
                const updateEmail = document.querySelector("#email").value;
                const updateBirthDate = document.querySelector("#birthdate").value;
                const updateSchool = document.querySelector("#school").value;
                const updateYear = document.querySelector("#year").value;
                const updateCourse = document.querySelector("#course").value;
                
                try{
                    const token = localStorage.getItem("token");
                    const res = await fetch("http://localhost:3000/update", {
                        method: "PUT",
                        headers: {
                            "Content-type": "application/json",
                            Authorization: "Bearer " + token
                        },
                        body: JSON.stringify({
                            username: updateName,
                            email: updateEmail,
                            birthdate: updateBirthDate,
                            school: updateSchool,
                            year: updateYear,
                            course: updateCourse
                        })
                    });

                    if (!res.ok) return;

                    location.reload();
                } catch (err) {
                    console.error(err);
                }
            });

            const uploadDropdown = document.getElementById("cameradd");
            uploadDropdown.addEventListener("click", () => {
                const udd = document.querySelector(".udd");
                udd.classList.toggle("drop");
            })

            const avatar = document.getElementById("avatar");
            avatar.addEventListener("change", async () => {
                if (!avatar.files.length) return;

                const formData = new FormData();
                formData.append("image", avatar.files[0]);
                
                try{
                    const token = localStorage.getItem("token");
                    const res = await fetch("http://localhost:3000/upload-avatar", {
                        method: "POST",
                        headers: {
                            Authorization: "Bearer " + token
                        },
                        body: formData
                    });

                    const data = await res.json();
                    if (data.avatar){
                        profilePic.src = data.avatar;
                    }
                } catch (err) {
                    console.error(err);
                }
            });

            const cover = document.getElementById("cover");
            cover.addEventListener("change", async () => {
                if(!cover.files.length) return;

                const formData = new FormData;
                formData.append("image", cover.files[0]);

                try {
                    const token = localStorage.getItem("token");
                    const res = await fetch("http://localhost:3000/upload-cover", {
                        method: "POST",
                        headers: {
                            Authorization: "Bearer " + token
                        },
                        body: formData
                    });

                    const data = await res.json();
                    if (data.cover) {
                        coverPhoto.src = data.cover;
                    }
                } catch (err){
                    console.error(err);
                }
            });
        }
    }

    const register = document.getElementById('register');
    if (register){
        document.getElementById("length").classList.add("hidden");
        document.getElementById("number").classList.add("hidden");
        document.getElementById("upper").classList.add("hidden");
        document.getElementById("error").classList.add("hidden");
        document.getElementById("existemail").classList.add("hidden");
        document.getElementById("existuser").classList.add("hidden");
        document.getElementById("unchecked").classList.add("hidden");

        const pass = document.getElementById("password");
        pass.addEventListener("input", function(){
            const value = pass.value;
            checkRule("length", value.length >= 6);
            checkRule("number", /[0-9!@#$%^&*]/.test(value));
            checkRule("upper", /[A-Z]/.test(value));
        });

        function checkRule(id, condition){
            const item = document.getElementById(id);
            
            if (condition) {
                item.classList.remove("hidden");
                item.style.color = "green";
            } else {
                item.classList.add("hidden");
            }
        }

        const form = document.getElementById('form');
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confpass = document.getElementById("confpass").value;
            const accept = document.getElementById("accept");

            if (!accept.checked) {
                const unchecked = document.getElementById("unchecked");
                unchecked.classList.remove("hidden");
                unchecked.style.color = "red";
                return;
            }

            document.getElementById("unchecked").classList.add("hidden");

            if (password !== confpass){
                const error = document.getElementById("error");
                error.classList.remove("hidden");
                error.style.color = "red";
                return;
            }

            document.getElementById("error").classList.add("hidden");

            if (password.length < 6) {
                document.getElementById("warning").style.color = "red";
                return;
            }
                document.getElementById("warning").classList.add("hidden");

            fetch("http://localhost:3000/register_account", {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, email, password })
            })
            .then(res => res.json())
            .then(data => {
                if (!data.ok) {
                    document.getElementById("existemail").classList.remove("hidden");
                    document.getElementById("existuser").classList.remove("hidden");
                    document.getElementById("existuser").style.color = "red";
                    document.getElementById("existemail").style.color = "red";
                    return;
                }
                document.getElementById("exist").classList.add("hidden");
                alert("Registration successful!");
            })
            .catch(err => console.error("Fetch error:", err));
        });
    }
});


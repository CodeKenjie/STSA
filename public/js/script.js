
function showHide(id, type){
    const img = document.getElementById(id);
    const pass = document.getElementById(type);

    if (img.src.match("/public/css/imgs/show.png")){
        pass.type = "text";
        img.src = "/public/css/imgs/hide.png";
    } else {
        pass.type = "password";
        img.src = "/public/css/imgs/show.png";
    }
}

function logout(event){
    event.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "login.html";
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
        const profile = document.getElementById("sidebar");
        if (profile) {
            const profilePic = document.getElementById("profilePic");
            const name = document.getElementById("username");
            const email = document.getElementById("email");
            const school = document.getElementById("school");
            const year = document.getElementById("year");
            const course = document.getElementById("course");
            const verification = document.getElementById("verification");

            async function getUser() {
                const token = localStorage.getItem("token");

                if(!token) {
                    console.log("No token found. Please Login first");
                    return;
                }

                try{
                    const res = await fetch("http://localhost:3000/index", {
                        headers: {
                            Authorization: "Bearer " + token
                        }
                    });

                    if (!res.ok) {
                        name.textContent = "Please log in";
                    }

                    const user = await res.json();

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
                    const res = await fetch("http://localhost:3000/index", {
                        headers: {
                            Authorization: "Bearer " + token
                        }
                    });

                    if (!res.ok) {
                        name.textContent = "Please log in";
                    }

                    const user = await res.json();
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

    const stsa = document.getElementById("stsa");
    if(stsa) {
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
    }
});


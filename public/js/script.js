
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

document.addEventListener("DOMContentLoaded", function(){
    const login = document.getElementById("login");
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

    const index = document.getElementById("index");
    if (index) {
        
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


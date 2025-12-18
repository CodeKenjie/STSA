document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("length").classList.add("hidden");
    document.getElementById("number").classList.add("hidden");
    document.getElementById("upper").classList.add("hidden");
    document.getElementById("error").classList.add("hidden");
    document.getElementById("existemail").classList.add("hidden");
    document.getElementById("existuser").classList.add("hidden");
    document.getElementById("unchecked").classList.add("hidden");
    
    const pass = document.getElementById("password");
    const strlabel = document.getElementById("strength");
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
});

function passShowHide(){
    const img = document.getElementById("psh");
    const pass = document.getElementById("password");

    if (img.src.match("/public/css/imgs/show.png")){
        pass.type = "text";
        img.src = "/public/css/imgs/hide.png";
    } else {
        pass.type = "password";
        img.src = "/public/css/imgs/show.png";
    }
}

function confPassShowHide(){
    const img = document.getElementById("cpsh");
    const pass = document.getElementById("confpass");

    if (img.src.match("/public/css/imgs/show.png")){
        pass.type = "text";
        img.src = "/public/css/imgs/hide.png";
        document.getElementById("unchecked").classList.add("hidden");
    } else {
        pass.type = "password";
        img.src = "/public/css/imgs/show.png";
        document.getElementById("unchecked").classList.add("hidden");
    }

}

function loginShowHide(){
    const img = document.getElementById("loginShowHide");
    const pass = document.getElementById("loginPassword");

    if (img.src.match("/public/css/imgs/show.png")){
        pass.type = "text";
        img.src = "/public/css/imgs/hide.png";
    } else {
        pass.type = "password";
        img.src = "/public/css/imgs/show.png";
    }
}

document.getElementById("form").addEventListener("submit", function (e) {
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

    fetch("/register_account", {
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



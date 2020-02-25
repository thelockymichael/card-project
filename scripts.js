window.onclick = (event) => {
    if (event.target === document.getElementById("logonBackground")) {
        cancelButton();
    } else if (event.target === document.getElementById("loginBackground")) {
        cancelButton();
    }
};

document.querySelector("#openPoker").addEventListener("click", async function () {
    await poker();
});

function cancelButton() {
    let element = document.getElementById("logonBackground");
    element.parentNode.removeChild(element);
}

function openPoker() {
    let file = "https://raw.githubusercontent.com/yostiq/card-project/master/poker.txt";

    fetch(file)
        .then((response) => response.text())
        .then((data) => document.body.innerHTML += data)
        .catch((error) => console.log(error));
}

function openLoginScreen() {
    let file = "https://raw.githubusercontent.com/yostiq/card-project/master/loginScreen.txt";

    fetch(file)
        .then((response) => response.text())
        .then((data) => document.body.innerHTML += data)
        .then(() => {
            document.getElementById("inputUsername").focus();
            enterPress();
        })
        .catch((error) => console.log(error));
}

function openSignUpScreen() {
    let file = "https://raw.githubusercontent.com/yostiq/card-project/master/signUpScreen.txt";

    fetch(file)
        .then((response) => response.text())
        .then((data) => document.body.innerHTML += data)
        .then(() => {
            document.getElementById("inputUsername").focus();
            enterPress();
        })
        .catch((error) => console.log(error));
}

function enterPress() {
    document.getElementById("inputUsername").addEventListener("keypress", (event) => {
        if(event.key === "Enter"){
            event.preventDefault();
            document.getElementById("submitButton").click();
        }
    });

    document.getElementById("inputPassword").addEventListener("keypress", (event) => {
        if(event.key === "Enter"){
            event.preventDefault();
            document.getElementById("submitButton").click();
        }
    });

    if(document.getElementById("inputConfirmPassword") !== null){
        document.getElementById("inputConfirmPassword").addEventListener("keypress", (event) => {
            if(event.key === "Enter"){
                event.preventDefault();
                document.getElementById("submitButton").click();
            }
        });
    }
}
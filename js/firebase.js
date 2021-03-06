let firebaseConfig = {
    apiKey: "AIzaSyCshPRphIpHeg5sj1i6O0K8iHcWxr5JVFQ",
    authDomain: "cardgame-project.firebaseapp.com",
    databaseURL: "https://cardgame-project.firebaseio.com",
    projectId: "cardgame-project",
    storageBucket: "cardgame-project.appspot.com",
    messagingSenderId: "576386674320",
    appId: "1:576386674320:web:0f8db7c2c8550a0cfbb215",
    measurementId: "G-45VCDFQGH3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let db = firebase.firestore();

let userLogged;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        userLogged = true;

        document.getElementById("loginLinks").style.display = "none";
        document.getElementById("userPanel").style.display = "flex";

        db.collection("users").doc(firebase.auth().currentUser.uid).get()
            .then((doc) => {
                document.getElementById("textUsername").innerHTML = doc.data().displayName[0].toUpperCase() + doc.data().displayName.slice(1);
            }).catch((error) => console.log(error));

        db.collection("users").doc(firebase.auth().currentUser.uid)
            .onSnapshot(function (doc) {
                document.getElementById("textMoneyLeft").innerHTML = doc.data().money;
            }, (error) => console.log(error));

    } else {
        userLogged = false;

        document.getElementById("loginLinks").style.display = "flex";
        document.getElementById("userPanel").style.display = "none";
    }
});

function login() {
    let email = document.getElementById("inputUsername").value;
    let password = document.getElementById("inputPassword").value;

    if (email === "") {
        document.getElementById("inputUsername").setCustomValidity("Field is empty");
        document.getElementById("inputUsername").focus();
    } else if (password === "") {
        document.getElementById("inputUsername").setCustomValidity("Field is empty");
        document.getElementById("inputUsername").focus();
    } else {
        email += "@randomemail.com";
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(() => firebase.auth().signInWithEmailAndPassword(email, password))
            .then(() => {
                cancelButton();
                location.reload();
            })
            .catch(function (error) {
                let errorCode = error.code;
                let errorMessage = error.message;
                console.log(errorCode);
                console.log(errorMessage);
                if (errorCode === "auth/user-not-found") {
                    document.getElementById("inputUsername").setCustomValidity("Username or password is incorrect");
                }
            });
    }
}

function logOut() {
    firebase.auth().signOut().catch((error) => console.log(error));
}

function createUser() {
    let username = document.getElementById("inputUsername").value;
    let password = document.getElementById("inputPassword").value;
    let confirmPassword = document.getElementById("inputConfirmPassword").value;

    document.getElementById("inputUsername").setCustomValidity("");
    document.getElementById("inputPassword").setCustomValidity("");
    document.getElementById("inputConfirmPassword").setCustomValidity("");

    if (username === "") {
        document.getElementById("inputUsername").setCustomValidity("Field is empty");
        document.getElementById("inputUsername").focus();
    } else if (password === "") {
        document.getElementById("inputPassword").setCustomValidity("Field is empty");
        document.getElementById("inputPassword").focus();
    } else if (password.length < 6) {
        document.getElementById("inputPassword").setCustomValidity("Password is too short. Min. 6 char.");
        document.getElementById("inputPassword").focus();
    } else if (confirmPassword === "") {
        document.getElementById("inputConfirmPassword").setCustomValidity("Field is empty");
        document.getElementById("inputConfirmPassword").focus();
    } else if (password !== confirmPassword) {
        document.getElementById("inputConfirmPassword").setCustomValidity("Passwords don't match");
    } else {
        let email = username + "@randomemail.com";
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(() => firebase.auth().createUserWithEmailAndPassword(email, password))
            .then(() => {
                console.log("UserId: " + firebase.auth().currentUser.uid);
                db.collection("users").doc(firebase.auth().currentUser.uid).set({
                    displayName: username.toLowerCase(),
                    money: 500
                }).then(() => {
                    cancelButton();
                    location.reload();
                }).catch(function (error) {
                    let errorCode = error.code;
                    let errorMessage = error.message;
                    console.log(errorCode);
                    console.log(errorMessage);
                });
            }).catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
            if (errorCode === "auth/invalid-email") {
                document.getElementById("inputUsername").setCustomValidity("Only letters and numbers are allowed.");
            } else if (errorCode === "auth/email-already-in-use") {
                document.getElementById("inputUsername").setCustomValidity("The username is already in use by another account.");
            }
        });
    }
}
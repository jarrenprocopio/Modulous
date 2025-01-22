const { ipcRenderer } = require('electron');

// Wait for the DOM to be ready before accessing elements
document.addEventListener('DOMContentLoaded', () => {
    const next_button = document.getElementById('nextButton');
    const connect_button = document.getElementById('connect');
    const ip_field = document.getElementById('client_address');
    const user_field = document.getElementById('userField');
    const pass_field = document.getElementById('passField');
    const back_button1 = document.getElementById('backbtn1');

    if (!next_button) {
        console.error('nextButton element not found!');
    }

    if (!ip_field) {
        console.error('client_address element not found!');
    }

    if (!user_field) {
        console.error('user_field element not found!');
    }

    if (!pass_field) {
        console.error('passField element not found!');
    }

    if (next_button && ip_field) {
        next_button.addEventListener('click', () => {
            ipcRenderer.send('client_next', ip_field.value);  // Send IP address to main process
        });
    }

    if (connect_button && user_field && pass_field) {
        connect_button.addEventListener('click', () => {
            console.log('Username:', user_field.value);
            console.log('Password:', pass_field.value);
            ipcRenderer.send('client_connect', user_field.value, pass_field.value);

        })
    }

    back_button1.addEventListener('click', () => {
        ipcRenderer.send('back_button1', 'back_button1');
    })

});


document.addEventListener('DOMContentLoaded', () => {
    const allButtons = document.querySelectorAll('button');
    console.log("All buttons on the page:", allButtons);

    const back_button2 = document.getElementById('backbtn2');
    if (back_button2) {
        console.log("found btn 2");
        back_button2.addEventListener('click', () => {
            console.log("Button click is being registered!");
            ipcRenderer.send('back_button2', 'back_button2');
        });
    } else {
        console.error("Button with id 'back_button2' not found in the DOM.");
    }
});
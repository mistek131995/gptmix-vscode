const submitLoginInForm = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const token = formData.get('token');

    const response = await fetch("https://gptmix.ru/api/v1/Chats/models", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        }
    });

    console.log(response.ok);
};

document.getElementById("login-in-form").addEventListener("submit", submitLoginInForm);
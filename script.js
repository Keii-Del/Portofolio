document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const message =
            document.getElementById("message").value.trim();

        if (name.length < 3) {
            alert("Nama minimal 3 karakter");
            return;
        }
        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            alert("Email tidak valid");
            return;
        }
        if (message.length < 10) {
            alert("Pesan minimal 10 karakter");
            return;
        }
        alert("Pesan berhasil dikirim!");
        form.reset();
    });
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target =
                document.querySelector(
                    this.getAttribute("href")
                );
            target.scrollIntoView({
                behavior: "smooth"
            });
        });
    });
});
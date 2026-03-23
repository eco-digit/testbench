document.addEventListener("DOMContentLoaded", function () {
  var loginPage = document.getElementsByClassName("login-pf-page")[0];
  var footerContainer = document.createElement("div");
  var currentYear = new Date().getFullYear();
  footerContainer.className = "footer-container";
  footerContainer.innerHTML = `<footer class="footer">
        <div class="footer-left">
            <p>&copy; ${currentYear} adesso SE</p>
        </div>
        <div class="footer-right">
          <a href="/imprint">Imprint</a><a href="/privacy-policy">Privacy Policy</a>
        </div>
    </footer>`;
  loginPage.appendChild(footerContainer);
});

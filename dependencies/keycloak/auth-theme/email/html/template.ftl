<#macro emailLayout>
  <html>
  <head>
    <style>
      * {
        font-family: 'Roboto', sans-serif;
      }

      body {
        background-color: #fbfcf6;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      a {
        display: inline-block;
        background-color: #2a6a47;
        color: #FFFFFF;
        padding: 14px 25px;
        text-align: center;
        text-decoration: none;
        font-size: 16px;
        opacity: 0.9;
        border-radius: 5px;
      }

      a:hover {
        color: white;
        background-color: #2a6a47;
        opacity: 1;
      }

      .logo {
        display: flex;
        justify-content: center;
        margin: 50px;
      }

      img {
        width: 30%;
        height: auto;
      }

      .emailContent {
        width: 70%;
        height: 70%;
        padding: 10px;
        text-align: center;
        border-top: 3px solid #2a6a47;
        border-bottom: 3px solid #2a6a47;
      }

      footer div {
        margin: 50px;
      }
    </style>
  </head>
  <body>
    <div class="logo">
      <img src='https://ecodigit.de/fileadmin/PR/ecodigit/ECO-DIGIT_LOGO_primaer.png' alt="ECO:DIGIT Logo">
    </div>
    <div class="emailContent">
      <#nested>
    </div>
  </body>
  <footer>
    <div>
      <p>&copy;${.now?string("yyyy")} adesso SE. All rights reserved.</p>
    </div>
  </footer>
  </html>
</#macro>

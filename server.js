const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Výchozí stav
const DEFAULT_BALANCE = 10000;
const users = {
  admin: { password: "1234", balance: DEFAULT_BALANCE },
  hacker: { password: "hack", balance: 5000 },
};

// Interval pro resetování adminova zůstatku každých 60 sekund
setInterval(() => {
  users.admin.balance = DEFAULT_BALANCE;
  console.log("Zůstatek admina byl resetován.");
}, 60000);

app.get("/", (req, res) => {
  const user = req.cookies.user;
  if (user && users[user]) {
    const balanceInfo = users[user].balance <= 9000 && user === "admin"
      ? `<p style="color:red;"><strong>FLAG(75145)</strong></p>`
      : "";
    res.send(`
      <html>
      <head>
        <title>Banka</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #e2e8f0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            width: 300px;
            text-align: center;
          }
          a, button {
            display: inline-block;
            margin-top: 10px;
            padding: 10px;
            border: none;
            border-radius: 5px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
          }
          button:hover, a:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Vítej, ${user} 👋</h2>
          <p><strong>Zůstatek:</strong> ${users[user].balance} Kč</p>
          ${balanceInfo}
          <a href="/transfer-form">💸 Převést peníze</a>
          <form action="/logout" method="POST">
            <button type="submit">🚪 Odhlásit</button>
          </form>
        </div>
      </body>
      </html>
    `);
  } else {
    res.send(`
      <html>
      <head>
        <title>Přihlášení do banky</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f1f1f1;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .login-box {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            width: 300px;
            text-align: center;
          }
          input {
            width: 100%;
            padding: 8px;
            margin: 8px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
          }
          button {
            background-color: #28a745;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            width: 100%;
            cursor: pointer;
          }
          button:hover {
            background-color: #218838;
          }
        </style>
      </head>
      <body>
        <div class="login-box">
          <h2>Přihlášení</h2>
          <form method="POST" action="/login">
            <input name="username" placeholder="uživatel" required /><br/>
            <input type="password" name="password" placeholder="heslo" required /><br/>
            <button type="submit">Přihlásit</button>
          </form>
        </div>
      </body>
      </html>
    `);
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username].password === password) {
    res.cookie("user", username);
    res.redirect("/");
  } else {
    res.send("Neplatné přihlašovací údaje");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect("/");
});

app.get("/transfer-form", (req, res) => {
  const user = req.cookies.user;
  if (!user || !users[user]) return res.send("Nepřihlášen");
  res.send(`
    <html>
    <head>
      <title>Převod</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f8f8f8;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .box {
          background-color: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          width: 300px;
        }
        input {
          width: 100%;
          padding: 8px;
          margin: 8px 0;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        button {
          background-color: #007bff;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 5px;
          width: 100%;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <h3>Převod peněz</h3>
        <form method="POST" action="/transfer">
          <input type="text" name="to" placeholder="Komu" required /><br/>
          <input type="number" name="amount" placeholder="Kolik" required /><br/>
          <button type="submit">Odeslat</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post("/transfer", (req, res) => {
  const user = req.cookies.user;
  if (!user || !users[user]) return res.send("Nepřihlášen");

  const { to, amount } = req.body;
  const amt = parseInt(amount);

  if (!users[to]) return res.send("Neexistující příjemce");
  if (isNaN(amt) || amt <= 0) return res.send("Neplatná částka");
  if (users[user].balance < amt) return res.send("Nedostatek prostředků");

  users[user].balance -= amt;
  users[to].balance += amt;

  res.send(`Převedeno ${amt} Kč na účet "${to}"`);
});

app.listen(port, () => {
  console.log(`Banka běží na http://localhost:${port}`);
});

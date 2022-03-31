const bca = require("../index");

const username = "xxxxxx";
const password = "xxxxxx";

bca.getSaldo(username, password).then((resp) => console.log(resp));

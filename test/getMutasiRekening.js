const bca = require("../index");

const username = "xxxxxx";
const password = "xxxxxx";

bca.getMutasiRekening(username, password).then((resp) => console.log(resp));

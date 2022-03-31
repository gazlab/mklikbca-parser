const bca = require("../index");

const username = "xxxxxx";
const password = "xxxxxx";

bca.getAll(username, password).then((resp) => console.log(resp));

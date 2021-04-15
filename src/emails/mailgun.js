const mailgun = require("mailgun-js");
const DOMAIN = "sandbox0501b42b54914c1b8ccbd40b4ba7fed6.mailgun.org";
const mg = mailgun({apiKey: "dfdba9331941045a86dd1a2de373be49-a09d6718-8ed633bf", domain: DOMAIN});
const data = {
	from: "Mailgun Sandbox <postmaster@sandbox0501b42b54914c1b8ccbd40b4ba7fed6.mailgun.org>",
	to: "nickcheng95@gmail.com",
	subject: "Hello",
	text: "Testing some Mailgun awesomness!"
};
mg.messages().send(data, function (error, body) {
	console.log(body);
});
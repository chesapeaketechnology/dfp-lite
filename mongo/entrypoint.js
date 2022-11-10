var db = connect("mongodb://localhost/db");

db.createUser(
    {
        user: "networksurvey",
        pwd: "networksurvey",
        roles: [ { role: "dbOwner", db: "db" } ]
    }
);
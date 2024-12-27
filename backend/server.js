const app = require("./app")

const dotenv = require("dotenv");
const connectDataBase = require("./config/database");


// Handling Uncaught Exception = > ye error vah hoti hai agr koi bhi alg se kuch bhi likh do define nhi h usko btata hai . 
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`shuttind sown the server due to Unhandled prromise rejection `);
    process.exit(1)
})
//config
dotenv.config({path:"backend/config/config.env"})

//connecting to database
connectDataBase();

server = app.listen(process.env.PORt,()=>{
    console.log(`server is working on http://localhost:${process.env.PORT}`);
})


//Unhandled promise Rejection -> yeh error jab hoti hai jab hamara server me koi problem ho jati hai ya sercer ko crash ya  band karna ho to eska use kiya jata hai 

process.on("unhandledRejection",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`Shutting down the server due to Unhandled promise Rejection `);
    server.close();
    process.exit(1);

})
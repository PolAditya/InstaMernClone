const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const USER = mongoose.model("USER");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const{ Jwt_Secret } = require("../keys");
const requireLogin = require("../middelware/requireLogin");




router.post('/signup', (req,res) => {
    const {name, userName, email, password}= req.body;
    
    if(!name || !userName || !email || !password){
        return res.status(422).json({error: "please add all the fields"});
    }


    
    USER.findOne({ $or: [{ email: email }, { userName: userName }] }).then((savedUser) => {
        if(savedUser){
            return res.status(422).json({error: "User already exist with that email or userName"})
        }
        
        bcrypt.hash(password, 12).then((hashedPassword)=>{
            const user = new USER({
                name,
                userName,
                email,
                password: hashedPassword
            })
        
            user.save()
            .then(user=>{return res.json({message: "Registered Successfully"})})
            .catch(err => {console.log(err)})

        })
       
    }).catch((error) => {
        // Handle any errors that occur during the findOne operation
        console.log(error);
        return res.status(500).json({ error: "An error occurred during user lookup" });
    });

    
})


router.post("/signin", (req, res) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(422).json({error: "Please add email and password"});
    }
    USER.findOne({email: email}).then((savedUser) => {
        if(!savedUser){
            return res.status(422).json({error: "Invalid Email"});
        }

        bcrypt.compare(password, savedUser.password).
        then((match)=>{
            if(match){
                // return res.status(200).json({
                //     message:"Signed In Successfully"
                // });
                const token = jwt.sign({id: savedUser.id}, Jwt_Secret);
                const {_id, name, email, userName} = savedUser;
                
                console.log({token, user:{_id, name, email, userName}});
                res.json({token, user:{_id, name, email, userName}});
            }else{
                return res.status(422).json({
                    error: "Invalid Password"
                });
            }
        }).catch(err => console.log(err));
    })
})

router.post("/googleLogin", (req, res) => {
    const {email_verified, email, name, clientId, userName, Photo} = req.body;
    if (email_verified){
        USER.findOne({email: email}).then((savedUser)=>{
            if(savedUser){
                const token = jwt.sign({id: savedUser.id}, Jwt_Secret)
                const {_id, name, email, userName} = savedUser;
                res.json({token, user:{_id, name, email, userName} })
                console.log({token, user:{_id, name, email, userName} })

            }else {
                const password = email + clientId
                const user = new USER({
                    name,
                    email,
                    userName,
                    password: password,
                    Photo
                })

                user.save()
                    .then(user => {
                        let userId = user._id.toString()
                        const token = jwt.sign({_id: userId}, Jwt_Secret)
                        const {_id, name, email, userName} = user;
                        res.json({token, user:{_id, name, email, userName} })
                        console.log({token, user: {_id, name, email, userName} })
                    })
                    .catch(err => {console.log(err) });
            }
        })
    }
})

module.exports = router;
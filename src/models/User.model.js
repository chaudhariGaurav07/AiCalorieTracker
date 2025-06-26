import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        index:true //easy to find in db
      },
      email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
      },
      password: {
        type: String,
        required: true,
      }
    }, { timestamps: true })


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next() ;

    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}


// jwt tokens 
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this.id,
            email: this.email,
            username: this.username,

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
          {
              _id: this._id,
  
          },
          process.env.REFRESH_TOKEN_SECRET,
          {
              expiresIn:process.env.REFRESH_TOKEN_EXPIRY
  
              
          }
      )
  }

export const User = mongoose.model("User", userSchema)
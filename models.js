import mongoose from "mongoose"
 
export default mongoose.model('Usuarios',{
    email: String,
    password: String,
    firstName: String,
    lastName: String
});

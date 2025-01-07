const User = require('../model/User')
const jwt = require('jsonwebtoken');
const dotEnv = require('dotenv')
const bcrypt = require('bcrypt')
dotEnv.config()

const createNewUser = async (req, res) =>{
    try {
       const {mobile,name,password}=req.body

       let user = await User.findOne({mobile})
       if(user){
        return res.status(500).json({message: 'mobile all ready in used, give another number '})
       }

       const hashPassword = await bcrypt.hash(password, 12)

        const savingUser =  new User({
            mobile,name,password: hashPassword
        })
        const savedUser = await savingUser.save()
        console.log(savedUser)
        res.status(200).json(savedUser)
    } catch (error) {
       res.status(500).json({message: 'error at backend'}) 
    }
}

const loginUser = async (req, res) => {
    try {
        const { name, password } = req.body;

        const user = await User.findOne({ name });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, mobile: user.mobile, name: user.name }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, mobile: user.mobile },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const { id } = req.params; 

        const user = await User.findById(id).select('-password'); 

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User fetched successfully', user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.status(200).json({ message: 'Users fetched successfully', users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


module.exports = {createNewUser, loginUser, getUser, getAllUsers }
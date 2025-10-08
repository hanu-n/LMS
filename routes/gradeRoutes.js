import express from 'express';
import Grade from '../models/Grade.js';
import  protect  from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/',roleMiddleware,async(req,res)=>{
   try {
     const {student,subject,score,remarks}=req.body

    if(!student || !subject || score===undefined){
              return res.status(400).json({ message: 'Student, subject, and score are required.' });
    }

   const grade = new Grade ({
      student,
      subject,
      score,
      remarks,
    });
    await grade.save()

    res.status(201).json({
      message: 'Grade created successfully',
      grade,
    });
   } catch (error) {
        console.log('❌ Error creating grade:', error);
    res.status(500).json({ message: 'Server error' });
   }

})

router.get('/:studentID',protect,async(req,res)=>{
const {studentID}=req.params

try {
    if (!mongoose.Types.ObjectId.isValid(studentID)) {
        return res.status(400).json({ message: 'Invalid student ID' });
    }

    if (req.user.role==='student' && req.user.userId !== studentID) {
        return res.status(403).json({ message: 'Access denied: Students can only view their own grades.' });
    }
const grades = await Grade.find({ student: studentID })
  .populate('name', 'email');

  res.status(201).json(grades)
} catch (error) {
        console.error('❌ Error fetching grades:', error);
    res.status(500).json({ message: 'Server error' });

}
})

export default router
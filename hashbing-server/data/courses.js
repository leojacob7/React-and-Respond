const { ObjectID } = require('bson');
const mongoCollections = require('../config/mongoCollection');
const courses = mongoCollections.courses;
const userData = require("./users")
const { objectIdToString } = require('../utils/utils');
const  users  = mongoCollections.users;
module.exports = {
    async createCourse(title,body,description,author,topicsTagged, courseOutcome1,courseOutcome2,courseOutcome3,courseOutcome4){
        // errorCheckingCourse(title,body,author);
        // const id = ObjectID(author);
        // const user = await userData.getUserByEmail(author);
        const usersCollection = await users();
		const user = await usersCollection.findOne({ email: author });
		if (user === null) throw 'No user with that id';
        console.log(user);
        if(!user)
            throw "Author not found";
        let topics = topicsTagged;
        if(topics != "")
            topics = topicsTagged.split(',');

        const courseCollection = await courses();
        const course = {
            title,
            body,
            description,
            author: author,
            topicsTagged:topics,
            courseOutcome1,
            courseOutcome2,
            courseOutcome3,
            courseOutcome4,
            metaData:{timeStamp:new Date().getTime(),published:false}
        }

        const newCourseInfo = await courseCollection.insertOne(course);
	    if (newCourseInfo.insertedCount === 0) throw 'Insert failed!';
        console.log(newCourseInfo.insertedId);
        user.courseAuthored.push(objectIdToString(newCourseInfo.insertedId));   
        const userCollection = await users();
	    const updateInfo = await userCollection.updateOne({ _id: user._id }, { $set: user });
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';
        console.log(user);
	    return "Insertion successful";
	  
    },
     async getCourseById(id){
         if(!id || typeof id != 'string')
            throw "Invalid id passed"
        const courseId = ObjectID(id);
        const courseCollection = await courses();
        const course = await courseCollection.findOne({_id:courseId});
        if(!course)
            throw "No course found with this id";
        return course;
     },

    async enrollToCourse(email,courseId){
        if(!email || !courseId)
            throw "Error with user's email or the course id not fetched..";
            courseId = ObjectID(courseId);
            const courseCollection = await courses();
            const course = await courseCollection.findOne({_id:courseId});
            if(!course)
                throw "No course found with this id, unable to register";
            const userCollection = await users();
		    const user = await userCollection.findOne({ email });
            if(!user){
                throw "Invalid user login, unable to register for the course";
            }
            const found = user.coursesEnrolled.find(element => element == objectIdToString(courseId));
            if(found){
                throw "Course already enrolled";
            }
            user.coursesEnrolled.push(objectIdToString(courseId));
            const updateInfo = await userCollection.updateOne({ _id: user._id }, { $set: user });
            if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';
            return "Enrolled successfully!!";
    },
    async unregisterCourse(email,courseId){
        if(!email || !courseId)
            throw "Error with user's email or the course id not fetched..";
        courseId = ObjectID(courseId);
        const courseCollection = await courses();
        const course = await courseCollection.findOne({_id:courseId});
        if(!course)
                throw "No course found with this id, unable to unregister";
        const userCollection = await users();
	    const user = await userCollection.findOne({ email });
        if(!user){
                throw "Invalid user login, unable to register for the course";
         }
         user.coursesEnrolled = user.coursesEnrolled.filter(function(value, index, arr){ 
            return value != objectIdToString(courseId);
        });
        const updateInfo = await userCollection.updateOne({ _id: user._id }, { $set: user });
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';
        return "Unregistered successfully!!";
    },
    async getAllAuthoredCourses(email){
		if(!email)
			throw "You must be signed in to update profile..";
		const userCollection = await users();
		const user = await userCollection.findOne({ email });
		if(!user)
			throw "Could not fetch user data";
		return user.courseAuthored;
	},
    async getAllEnrolledCourses(email){
        if(!email)
			throw "You must be signed in to update profile..";
		const userCollection = await users();
		const user = await userCollection.findOne({ email });
		if(!user)
			throw "Could not fetch user data";
		return user.coursesEnrolled;
    },
    async getAllCourses(){
        const courseCollection = await courses();
        const allCourses = await courseCollection.find({}).toArray();
        if(!allCourses)
            throw "could not fetch courses";
        console.log(allCourses);
        return allCourses;

    }

}

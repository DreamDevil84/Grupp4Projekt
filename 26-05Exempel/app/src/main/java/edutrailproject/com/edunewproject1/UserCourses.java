package edutrailproject.com.edunewproject1;

import org.json.*;

public class UserCourses {

    public String id;
    public String grade;
    public String status;


    public UserCourses(){};

    public UserCourses(String id, String grade, String status){

        this.id = id;
        this.grade = grade;
        this.status = status;
    }

    public String getCourseid() {
        return id;
    }

    public String getGrade() {
        return grade;
    }
}
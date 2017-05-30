package edutrailproject.com.edunewproject1;


public class DisplayCourses {

    public String description;
    public String id;
    public String title;
    public String gradeReq;
    public String details;
    public String grade;
    public String status;

    //public String[] schedule;


    public DisplayCourses(){};

    public DisplayCourses(String description, String id, String title, String details, String gradeReq, String grade, String status){

        this.description = description;
        this.id = id;
        this.title = title;
        this.details = details;
        this.gradeReq = gradeReq;
        this.grade = grade;
        this.status = status;

    }

    public String getDescription() {
        return description;
    }


    public String getTitle() {
        return title;
    }
}
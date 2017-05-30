package edutrailproject.com.edunewproject1;

public class Courses {

    public String description;
    public String id;
    public String title;
    public String gradeReq;
    public String details;
    //public String[] schedule;


    public Courses(){};

    public Courses(String description, String id, String title, String details, String gradeReq){

        this.description = description;
        this.id = id;
        this.title = title;
        this.details = details;
        this.gradeReq = gradeReq;

    }

    public String getDescription() {
        return description;
    }

    public String getCourseid() {
        return id;
    }

    public String getTitle() {
        return title;
    }
}
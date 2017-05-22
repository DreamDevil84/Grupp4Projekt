package bettercallnilsson.com.androidapp1;

public class Courses {

    public String description;
    public String courseid;
    public String title;


    public Courses(){};

    public Courses(String description, String courseid, String title){

        this.description = description;
        this.courseid = courseid;
        this.title = title;


    }

    public String getDescription() {
        return description;
    }

    public String getCourseid() {
        return courseid;
    }

    public String getTitle() {
        return title;
    }
}

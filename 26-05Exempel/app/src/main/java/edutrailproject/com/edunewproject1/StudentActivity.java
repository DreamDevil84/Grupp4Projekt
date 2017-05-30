package edutrailproject.com.edunewproject1;


import android.content.DialogInterface;
import android.content.Intent;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import org.json.*;

import java.util.ArrayList;
import java.util.List;

public class StudentActivity extends AppCompatActivity {

    private static final String TAG = "WhatEver";

    private FirebaseAuth firebaseAuth;
    private DatabaseReference mDatabase;
    private DatabaseReference uDatabase;
    Courses courses = new Courses();
    ListView listViewCourses;
    List<Courses> courseList;
    List<UserCourses> userCourseList;
    List<DisplayCourses> displayList;
    private String userID;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_student);

        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        listViewCourses = (ListView) findViewById(R.id.listViewCourses);
        courseList = new ArrayList<>();
        userCourseList = new ArrayList<>();
        displayList = new ArrayList<>();

        firebaseAuth = FirebaseAuth.getInstance();
        FirebaseUser user = firebaseAuth.getCurrentUser();
        if (firebaseAuth.getCurrentUser() == null) {
            finish();
            startActivity(new Intent(this, MainActivity.class));
        }
        mDatabase = FirebaseDatabase.getInstance().getReference("courses");
        uDatabase = FirebaseDatabase.getInstance().getReference("users");

        listViewCourses.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Intent intent = new Intent(StudentActivity.this, CourseDetail.class);
                intent.putExtra("title", displayList.get(position).title);
                intent.putExtra("id", displayList.get(position).id);
                intent.putExtra("description", displayList.get(position).description);
                intent.putExtra("gradeReq", displayList.get(position).gradeReq);
                intent.putExtra("grade", displayList.get(position).grade);
                intent.putExtra("details", displayList.get(position).details);
                startActivity(intent);
            }
        });

    }






    @Override
    protected void onStart() {
        super.onStart();
        //displayList.clear();
        FirebaseUser user = firebaseAuth.getCurrentUser();
        displayList.clear();
        uDatabase.child(user.getUid() + "/courses").addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                userCourseList.clear();
                for (DataSnapshot userCourseSnapshot : dataSnapshot.getChildren()) {
                    String id = (String) userCourseSnapshot.child("id").getValue();
                    String grade = (String) userCourseSnapshot.child("grade").getValue();
                    String status = (String) userCourseSnapshot.child("status").getValue();
                    UserCourses userCourses = new UserCourses(id, grade, status);
                    //UserCourses userCourses = userCourseSnapshot.getValue(UserCourses.class);
                    userCourseList.add(userCourses);
                };

                mDatabase.addValueEventListener(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot dataSnapshot) {

                        courseList.clear();
                        for (DataSnapshot courseSnapshot : dataSnapshot.getChildren()) {
                            //Log.e(TAG, courseSnapshot.getValue().toString());
                            String description = (String) courseSnapshot.child("description").getValue();
                            String id = (String) courseSnapshot.child("id").getValue();
                            String title = (String) courseSnapshot.child("title").getValue();
                            String details = (String) "placeholder";//courseSnapshot.child("details").getValue();
                            String gradeReq = (String) courseSnapshot.child("gradeReq").getValue();
                            Courses courses = new Courses(description, id, title, details, gradeReq);

                            courseList.add(courses);
                        }

                        //Log.e(TAG, courseList.toString());
                        for (int i = 0; i < userCourseList.size(); i++) {
                            for (int j = 0; j < courseList.size(); j++) {
                                if (userCourseList.get(i).id.equals(courseList.get(j).id)) {
                                    DisplayCourses course = new DisplayCourses(
                                            courseList.get(j).description,
                                            courseList.get(j).id,
                                            courseList.get(j).title,
                                            courseList.get(j).details,
                                            courseList.get(j).gradeReq,
                                            userCourseList.get(i).grade,
                                            userCourseList.get(i).status);
                                    displayList.add(course);
                                }
                            }
                        }
                        //Log.e(TAG, displayList.toString());


                        DisplayCourseList adapter = new DisplayCourseList(StudentActivity.this, displayList);
                        listViewCourses.setAdapter(adapter);
                    }


                    @Override
                    public void onCancelled(DatabaseError databaseError) {

                    }
                });

            }
            @Override
            public void onCancelled (DatabaseError databaseError){
            }

        });
    }


}
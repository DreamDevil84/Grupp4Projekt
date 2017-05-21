package bettercallnilsson.com.androidapp1;

import android.content.DialogInterface;
import android.content.Intent;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
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

import java.util.ArrayList;
import java.util.List;

public class StudentActivity extends AppCompatActivity {

    private FirebaseAuth firebaseAuth;
    private DatabaseReference mDatabase;
    Courses courses = new Courses();
    ListView listViewCourses;
    List<Courses> courseList;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_student);
        mDatabase = FirebaseDatabase.getInstance().getReference("courses");
        listViewCourses = (ListView) findViewById(R.id.listViewCourses);
        courseList = new ArrayList<>();

        firebaseAuth = FirebaseAuth.getInstance();
        if (firebaseAuth.getCurrentUser() == null) {
            finish();
            startActivity(new Intent(this, MainActivity.class));
        }

        //welcome = (TextView) findViewById(R.id.welcome);

        //get userinfo and send it to a textview
        //FirebaseUser user = firebaseAuth.getCurrentUser();
        //welcome.setText("Welcome " + user.getEmail() + courses.title);
    }






    @Override
    protected void onStart() {
        super.onStart();

            mDatabase.addValueEventListener(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {

                    courseList.clear();
                    for(DataSnapshot courseSnapshot : dataSnapshot.getChildren()){
                        Courses courses = courseSnapshot.getValue(Courses.class);

                        courseList.add(courses);

                    }

                    CourseList adapter = new CourseList(StudentActivity.this, courseList);
                    listViewCourses.setAdapter(adapter);

                }

                @Override
                public void onCancelled(DatabaseError databaseError) {

                }

        });

    }

    public void signOut(){
        firebaseAuth.signOut();
        finish();
        startActivity(new Intent(this, MainActivity.class));
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menulayout, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {

        switch(item.getItemId()) {
            case R.id.feedback:
                Intent intent = new Intent(this, FeedbackActivity.class);
                startActivity(intent);
                return true;
            case R.id.presence:
                Intent intent2 = new Intent(this, PresenceActivity.class);
                startActivity(intent2);
                return true;
            case R.id.logout:
                new AlertDialog.Builder(this)
                        .setTitle("Sign out")
                        .setMessage("Are you sure you want to log out?")
                        .setPositiveButton(android.R.string.yes, new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int which) {
                                signOut();
                            }
                        })
                        .setNegativeButton(android.R.string.no, new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int which) {
                                return;
                            }
                        })
                        .setIcon(android.R.drawable.ic_dialog_alert)
                        .show();

                default:
                return super.onOptionsItemSelected(item);
            }

    }
}
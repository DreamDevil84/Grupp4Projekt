package edutrailproject.com.edunewproject1;


import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
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

public class CourseDetail extends AppCompatActivity {
    public static final String TAG = "Debug";

    private Button bDetails, bSchedule, bGrades;
    private TextView tDetails, tGrades;
    private ListView lGrades;
    private DatabaseReference lRef;
    private FirebaseAuth firebaseAuth;
    private List<GradeWork> gradeWorkList;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_course_detail);

        bDetails = (Button)findViewById(R.id.btnDetails);
        bSchedule = (Button)findViewById(R.id.btnSchedule);
        bGrades = (Button)findViewById(R.id.btnGrades);
        tDetails = (TextView)findViewById(R.id.txtDetail);
        tGrades = (TextView)findViewById(R.id.txtGrade);
        lGrades = (ListView)findViewById(R.id.listGrades);

        gradeWorkList = new ArrayList<>();


        firebaseAuth = FirebaseAuth.getInstance();
        FirebaseUser user = firebaseAuth.getCurrentUser();

        Bundle bundle = getIntent().getExtras();
        String sDetails = bundle.getString("details");
        String sID = bundle.getString("id");
        String sGrade = bundle.getString("grade");
        String sGradeReq = bundle.getString("gradeReq");
        String sDescription = bundle.getString("description");
        String sTitle = bundle.getString("title");
        Log.e(TAG, "" + bundle.get("title"));
        Log.e(TAG, "" + sGrade);
        lRef = FirebaseDatabase.getInstance().getReference().child("users/" + user.getUid() + "/courses/" + sID + "/gradeWork");

        tDetails.setText(sDetails);
        tGrades.setText(sGrade);
        tGrades.setVisibility(View.INVISIBLE);
        tDetails.setVisibility(View.INVISIBLE);
        lGrades.setVisibility(View.INVISIBLE);

        bDetails.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                tDetails.setVisibility(View.VISIBLE);
                tGrades.setVisibility(View.INVISIBLE);
                lGrades.setVisibility(View.INVISIBLE);


            }
        });
        bGrades.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                tDetails.setVisibility(View.INVISIBLE);
                tGrades.setVisibility(View.VISIBLE);
                lGrades.setVisibility(View.VISIBLE);
            }
        });
    }

    @Override
    protected void onStart() {
        super.onStart();
        if (gradeWorkList != null){
            gradeWorkList.clear();
        }
        lRef.addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                for (DataSnapshot gradeWorkSnapshot: dataSnapshot.getChildren()){
                    String name =  gradeWorkSnapshot.getKey();
                    String grade = (String) gradeWorkSnapshot.getValue();
                    GradeWork grades = new GradeWork(name, grade);
                    gradeWorkList.add(grades);
                }

                DisplayGradeWorkList adapter = new DisplayGradeWorkList(CourseDetail.this, gradeWorkList);
                lGrades.setAdapter(adapter);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {

            }
        });
    }
}

package bettercallnilsson.com.androidapp1;

import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.widget.ArrayAdapter;
import android.widget.ListView;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import java.util.ArrayList;

/**
 * Created by ericapalm on 2017-05-20.
 */

public class myGrades extends AppCompatActivity {
    private static final String TAG = "myGrades";

    private FirebaseDatabase mFirebaseDatabase;
    private FirebaseAuth mAuth;
    private FirebaseAuth.AuthStateListener mAuthListener;
    private DatabaseReference myRef;
    private String userID;
    private ListView myGradesView;


    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.mygrades);

        myGradesView = (ListView) findViewById(R.id.mygradeslist);

        mAuth = FirebaseAuth.getInstance();
        mFirebaseDatabase = FirebaseDatabase.getInstance();
        myRef = mFirebaseDatabase.getReference();
        FirebaseUser user = mAuth.getCurrentUser();
        userID = user.getUid();

        /*mAuthListener = new FirebaseAuth.AuthStateListener() {
            @Override
            public void onAuthStateChanged(@NonNull FirebaseAuth firebaseAuth) {
                FirebaseUser user = firebaseAuth.getCurrentUser();
                if (user != null) {
                    // User is signed in
                    Log.d(TAG, "onAuthStateChanged:signed_in:" + user.getUid());
                } else {
                    // User is signed out
                    Log.d(TAG, "onAuthStateChanged:signed_out");
                }
                // ...
            }
        };*/
        myRef.addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                // This method is called once with the initial value and again
                // whenever data at this location is updated.
                showData(dataSnapshot);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {

            }
        });
    }
    private void showData(DataSnapshot dataSnapshot) {
        for(DataSnapshot ds : dataSnapshot.getChildren()) {
            gradeSitterGitter uInfo = new gradeSitterGitter();
            Users userinformation = ds.child(userID).getValue(Users.class);
            if (userinformation != null) {
                ArrayList<String> array = new ArrayList<>();

                gradeSitterGitter grade = userinformation.courses.get(0);
                if (grade != null) {
                    String coursegrade = grade.getCoursegrade();
                    uInfo.setCoursegrade(coursegrade); //set the name
                    uInfo.setCoursetitle(ds.child(userID).getValue(gradeSitterGitter.class).getCoursetitle()); //set the email


                    Log.d(TAG, "showData: grade: " + uInfo.getCoursegrade());
                    Log.d(TAG, "showData: id: " + uInfo.getCoursetitle());

                    array.add(uInfo.getCoursegrade());
                    array.add(uInfo.getCoursetitle());

                }
                ArrayAdapter adapter = new ArrayAdapter(this, android.R.layout.simple_list_item_1, array);
                myGradesView.setAdapter(adapter);
            }

        }

        /*myGradesView = (ListView) findViewById(R.id.mygradeslist);

        DatabaseReference databaseReference = FirebaseDatabase.getInstance().getReferenceFromUrl
                ("https://schoolweb-35754.firebaseio.com/users");

        FirebaseListAdapter<String> firebaseListAdapter = new FirebaseListAdapter<String>(this, String.class, android.R.layout.simple_dropdown_item_1line, databaseReference) {

            @Override
            protected void populateView(View v, String model, int position) {

                TextView textView = (TextView) v.findViewById(android.R.id.text1);
                textView.setText(model);

            }
        };
        myGradesView.setAdapter(firebaseListAdapter);*/


    }
    @Override
    public void onStart() {
        super.onStart();
        mAuth.addAuthStateListener(mAuthListener);
    }

    @Override
    public void onStop() {
        super.onStop();
        if (mAuthListener != null) {
            mAuth.removeAuthStateListener(mAuthListener);
        }
    }

}

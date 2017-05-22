package bettercallnilsson.com.androidapp1;

import android.icu.text.SimpleDateFormat;
import android.icu.util.Calendar;
import android.os.Build;
import android.support.annotation.NonNull;
import android.support.annotation.RequiresApi;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.google.firebase.analytics.FirebaseAnalytics;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

public class FeedbackActivity extends AppCompatActivity {
    private static final String TAG = "GiveFeedBack";

    private FirebaseAuth mAuth;
    private FirebaseAuth.AuthStateListener mAuthListener;
    private FirebaseDatabase mfirebaseDatabase;
    private DatabaseReference myRef;

    private Button signOutbtn, sadBtn, okBtn, happyBtn;
    private TextView nameTextView;
    private String userID;



    private DatabaseReference database;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_feedback);


        sadBtn = (Button) findViewById(R.id.sadbtn);
        okBtn = (Button) findViewById(R.id.normalbtn);
        happyBtn = (Button) findViewById(R.id.happybtn);
        nameTextView = (TextView) findViewById(R.id.nameView);

        FirebaseUser loginPerson = mAuth.getCurrentUser();
        nameTextView.setText("Hello: " + loginPerson.getEmail());

        mAuth = FirebaseAuth.getInstance();
        mfirebaseDatabase = FirebaseDatabase.getInstance();
        myRef = mfirebaseDatabase.getReference();


        sadBtn.setOnClickListener(new View.OnClickListener() {
            @RequiresApi(api = Build.VERSION_CODES.N)
            @Override
            public void onClick(View v) {
                FirebaseUser user = mAuth.getCurrentUser();
                String userID = user.getUid();
                myRef.child("feedback").child("daily").child(getDate()).child("hasVoted").child(userID).child("theirVote").setValue(-1);
                toastMessage("Thanks for your feed back");

            }
        });

        okBtn.setOnClickListener(new View.OnClickListener() {
            @RequiresApi(api = Build.VERSION_CODES.N)
            @Override
            public void onClick(View v) {
                FirebaseUser user = mAuth.getCurrentUser();
                String userID = user.getUid();
                myRef.child("feedback").child("daily").child(getDate()).child("hasVoted").child(userID).child("theirVote").setValue(0);
                toastMessage("Thanks for your feed back");

            }
        });
        happyBtn.setOnClickListener(new View.OnClickListener() {
            @RequiresApi(api = Build.VERSION_CODES.N)
            @Override
            public void onClick(View v) {
                FirebaseUser user = mAuth.getCurrentUser();
                String userID = user.getUid();
                myRef.child("feedback").child("daily").child(getDate()).child("hasVoted").child(userID).child("theirVote").setValue(1);
                toastMessage("Thanks for your feed back");
            }
        });
    }
    @RequiresApi(api = Build.VERSION_CODES.N)
    private String getDate(){
        Calendar c = Calendar.getInstance();
        SimpleDateFormat df = new SimpleDateFormat("yyyy-dd-MM");
        String formattedDate = df.format(c.getTime());
        return  formattedDate;

    }
    /*myRef.child("feedback").child("daily").child("hasvoted").child("2017-4-18").child(userID).child("positive").setValue(positive);
                toastMessage("Thanks for your feedback");*/
/*    @Override
    protected void onStop() {
        super.onStop();
        if(mAuthListener!=null){
            mAuth.removeAuthStateListener(mAuthListener);
        }
    }*/


    private void toastMessage(String message){
        Toast.makeText(this,message,Toast.LENGTH_SHORT).show();
    }

}
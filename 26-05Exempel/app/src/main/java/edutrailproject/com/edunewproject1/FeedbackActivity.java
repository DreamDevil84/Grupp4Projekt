package edutrailproject.com.edunewproject1;


import android.app.Notification;
import android.app.NotificationManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.icu.text.SimpleDateFormat;
import android.icu.util.Calendar;
import android.os.Build;
import android.support.annotation.NonNull;
import android.support.annotation.RequiresApi;
import android.support.v4.app.NotificationCompat;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.Switch;
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
import com.google.firebase.iid.FirebaseInstanceId;

import java.util.Date;

public class FeedbackActivity extends AppCompatActivity {
    private static final String TAG = "GiveFeedBack";
    private Button presentBtn;
    private Button newsBtn;


    private FirebaseAuth mAuth;
    private FirebaseAuth.AuthStateListener mAuthListener;
    private FirebaseDatabase mfirebaseDatabase;
    private DatabaseReference fRef;
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

        newsBtn = (Button) findViewById(R.id.newsBtn);

        mAuth = FirebaseAuth.getInstance();

        /*FirebaseUser loginPerson = mAuth.getCurrentUser();
        nameTextView.setText("Hello: " + loginPerson.getEmail());*/

        mfirebaseDatabase = FirebaseDatabase.getInstance();
        myRef = mfirebaseDatabase.getReference();

        newsBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(FeedbackActivity.this, StudentNews.class);
                startActivity(intent);
            }
        });

        Intent startFeedbackNotify = new Intent(this, FeedbackReminder.class);
        startService(startFeedbackNotify);

        presentBtn = (Button) findViewById(R.id.presenceBtn);
        presentBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.d(TAG, "onClick: attempting to add object to database");
                FirebaseUser user = mAuth.getCurrentUser();
                final String userId = user.getUid();

                String token = FirebaseInstanceId.getInstance().getToken();
                Log.e(TAG, token);

                myRef.child("attendance").child(getDate() + "/" + userId ).addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot dataSnapshot) {

                        if (dataSnapshot.hasChild("status")) {

                            long currentPres = (long) dataSnapshot.child("status").getValue();
                            if (currentPres == 1) {
                                myRef.child("attendance").child(getDate()).child(userId).child("status").setValue(2);
                                toastMessage("You are late");
                                presentBtn.setText("You are late");
                            } else if (currentPres == 2) {
                                myRef.child("attendance").child(getDate()).child(userId).child("status").setValue(3);
                                toastMessage("You are not present");
                                presentBtn.setText("You are not present");
                            } else if (currentPres == 3) {
                                myRef.child("attendance").child(getDate()).child(userId).child("status").setValue(1);
                                toastMessage("You are present");
                                presentBtn.setText("Your are present");
                            }
                        }
                        else
                        {
                            myRef.child("attendance").child(getDate()).child(userId).child("status").setValue(3);
                        }
                    }
                    @Override
                    public void onCancelled(DatabaseError databaseError) {

                    }
                });
            }
        });

    }




    public void onClick(View v) {
        long x = 0;
        switch (v.getId()) {
            case R.id.sadbtn:
                x = -1;
                break;
            case R.id.normalbtn:
                x = 0;
                break;
            case R.id.happybtn:
                x = 1;
                break;
        }
        feedback(x);
    }

    public void feedback(final long vote) {

        Log.d(TAG, "onClick: attempting to add object to database");
        FirebaseUser user = mAuth.getCurrentUser();
        final String userId = user.getUid();
        myRef.child("feedback").child("daily/" + getDate() + "/hasVoted/" + userId + "/theirVote")
                .addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot dataSnapshot) {
                        long theirVote;
                        if (dataSnapshot.getValue() != null) {
                            toastMessage("You already gave feedback.");
                        } else {
                            myRef.child("feedback").child("daily/" + getDate())
                                    .addListenerForSingleValueEvent(new ValueEventListener() {
                                        @Override
                                        public void onDataChange(DataSnapshot dataSnapshot) {
                                            long likes = 0;
                                            long votes;
                                            if (dataSnapshot.child("likes").getValue() == null || dataSnapshot.child("votes").getValue() == null) {
                                                likes = 0;
                                                votes = 0;
                                            } else {
                                                likes = (long) dataSnapshot.child("likes").getValue();
                                                votes = (long) dataSnapshot.child("votes").getValue();
                                            }
                                            myRef.child("feedback/daily/" + getDate() + "/likes").setValue(likes + vote);
                                            myRef.child("feedback/daily/" + getDate() + "/votes").setValue(votes + 1);
                                            myRef.child("feedback/daily/" + getDate() + "/hasVoted/" + userId + "/theirVote").setValue(vote);

                                            toastMessage("Thanks for your feed back");

                                        }

                                        @Override
                                        public void onCancelled(DatabaseError databaseError) {

                                        }
                                    });
                        }

                    }

                    @Override
                    public void onCancelled(DatabaseError databaseError) {

                    }
                });

    }

    //@RequiresApi(api = Build.VERSION_CODES.N)
    public String getDate() {
        Date date = new Date();
        String dateString = date.toString();
        String dateYear = dateString.substring(30, 34);
        String dateMonth = dateString.substring(4, 7);
        switch (dateMonth) {
            case "Jan":
                dateMonth = "01";
                break;
            case "Feb":
                dateMonth = "02";
                break;
            case "Mar":
                dateMonth = "03";
                break;
            case "Apr":
                dateMonth = "04";
                break;
            case "May":
                dateMonth = "05";
                break;
            case "Jun":
                dateMonth = "06";
                break;
            case "Jul":
                dateMonth = "07";
                break;
            case "Aug":
                dateMonth = "08";
                break;
            case "Sep":
                dateMonth = "09";
                break;
            case "Oct":
                dateMonth = "10";
                break;
            case "Nov":
                dateMonth = "11";
                break;
            case "Dec":
                dateMonth = "12";
                break;
        }
        String dateDay = dateString.substring(8, 10);
        String ds = dateYear + "-" + dateMonth + "-" + dateDay;
        //Calendar c = Calendar.getInstance();
        //SimpleDateFormat df = new SimpleDateFormat("yyyy-dd-MM");
        //String formattedDate = df.format(c.getTime());
        return ds;

    }

    @Override
    protected void onStop() {
        super.onStop();
        if (mAuthListener != null) {
            mAuth.removeAuthStateListener(mAuthListener);
        }
    }

    public void toastMessage(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    public void signOut() {
        mAuth.signOut();
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

        switch (item.getItemId()) {

            case R.id.studentActivity:
                Intent intent1 = new Intent(this, StudentActivity.class);
                startActivity(intent1);
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

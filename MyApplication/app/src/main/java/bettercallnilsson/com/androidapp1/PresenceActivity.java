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
import android.widget.EditText;
import android.widget.Toast;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

public class PresenceActivity extends AppCompatActivity {

    private final static String TAG = "PresenceActivity";


    private Button presentBtn;


    private FirebaseAuth mAuth;
    private FirebaseAuth.AuthStateListener mAuthListener;
    private FirebaseDatabase mfirebaseDatabase;
    private DatabaseReference myRef;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_presence);

        mAuth = FirebaseAuth.getInstance();
        mfirebaseDatabase = FirebaseDatabase.getInstance();
        myRef = mfirebaseDatabase.getReference();

        presentBtn = (Button)findViewById(R.id.button2);

        presentBtn.setOnClickListener(new View.OnClickListener() {
            @RequiresApi(api = Build.VERSION_CODES.N)
            @Override
            public void onClick(View v) {

                Log.d(TAG, "onClick: attempting to add object to database");

                FirebaseUser user = mAuth.getCurrentUser();
                final String userId = user.getUid();
                myRef.child("attendance").child(getDate() + "/" + userId + "/status").addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot dataSnapshot) {

                        long currentPres = (long) dataSnapshot.getValue();

                        if (currentPres == 0){
                            myRef.child("attendance").child(getDate()).child(userId).child("status").setValue(3);
                        }else {
                            if (currentPres == 1) {
                                myRef.child("attendance").child(getDate()).child(userId).child("status").setValue(2);
                                toastMessage("You are late");
                                presentBtn.setText("You are late");
                            } else if (currentPres == 2) {
                                myRef.child("attendance").child(getDate()).child(userId).child("status").setValue(3);
                                toastMessage("You are ill");
                                presentBtn.setText("You are ill");
                            } else if (currentPres == 3)
                                myRef.child("attendance").child(getDate()).child(userId).child("status").setValue(1);
                            toastMessage("You are present");
                                presentBtn.setText("Your are present");

                        };
                    }

                    @Override
                    public void onCancelled(DatabaseError databaseError) {

                    }
                });

            }
        });
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    private String getDate(){
        Calendar c = Calendar.getInstance();
        SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd");
        String formattedDate = df.format(c.getTime());
        return  formattedDate;

    }


    @Override
    protected void onStop() {
        super.onStop();
        if(mAuthListener!=null){
            mAuth.removeAuthStateListener(mAuthListener);
        }
    }

    private void toastMessage(String message){
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }


}


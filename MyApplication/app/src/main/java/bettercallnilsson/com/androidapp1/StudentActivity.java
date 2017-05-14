package bettercallnilsson.com.androidapp1;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

public class StudentActivity extends AppCompatActivity {

    private FirebaseAuth firebaseAuth;

    private TextView welcome;
    public Button signoutButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_student);

        firebaseAuth = FirebaseAuth.getInstance();
        if(firebaseAuth.getCurrentUser() == null){
            finish();
            startActivity(new Intent(this, MainActivity.class));
        }
        welcome = (TextView) findViewById(R.id.welcome);
        signoutButton = (Button) findViewById(R.id.signoutButton);

        FirebaseUser user = firebaseAuth.getCurrentUser();
        welcome.setText("Welcome " + user.getEmail());

    }

    public void signOut(View view){
        firebaseAuth.signOut();
        finish();
        startActivity(new Intent(this, MainActivity.class));
    }

}

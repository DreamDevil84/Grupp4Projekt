package bettercallnilsson.com.androidapp1;

import android.content.DialogInterface;
import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageButton;
import android.widget.Toast;

public class FeedbackActivity extends AppCompatActivity implements View.OnClickListener {

    ImageButton happy;
    ImageButton neutral;
    ImageButton sad;
    int a = 15;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_feedback);

        happy = (ImageButton) findViewById(R.id.happyButton);
        happy.setOnClickListener(this);
        neutral = (ImageButton) findViewById(R.id.neutralButton);
        neutral.setOnClickListener(this);
        sad = (ImageButton) findViewById(R.id.sadButton);
        sad.setOnClickListener(this);



    }

    public void onClick(View v){

            switch (v.getId()) {

                case R.id.happyButton:
                    moveToMain();
                    a = 1;
                    break;
                case R.id.neutralButton:
                    moveToMain();
                    a = 0;
                    break;
                case R.id.sadButton:
                    moveToMain();
                    a = -1;
                    break;

                default:
                    break;

            }

        Toast.makeText(this, "Value = " + a, Toast.LENGTH_LONG).show();

    }

    public void moveToMain(){

        Intent intent = new Intent(this, StudentActivity.class);
        startActivity(intent);

    }



}
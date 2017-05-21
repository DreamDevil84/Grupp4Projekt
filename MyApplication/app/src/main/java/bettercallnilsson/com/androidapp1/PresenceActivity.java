package bettercallnilsson.com.androidapp1;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.Toast;

public class PresenceActivity extends AppCompatActivity {

    Spinner presenceSpinner;
    Button sendPresenceButton;
    String a;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_presence);

        sendPresenceButton = (Button) findViewById(R.id.sendPresence);
        presenceSpinner = (Spinner) findViewById(R.id.spinner);

        ArrayAdapter<CharSequence> myAdapter = ArrayAdapter.createFromResource
                (this, R.array.presenceList, android.R.layout.simple_spinner_item);

        myAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);

        presenceSpinner.setAdapter(myAdapter);

        presenceSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {

                a = parent.getItemAtPosition(position).toString();
                //send a to firebase with userinfo, date

            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {

            }
        });

    }

    public void sendPresence(View view){

        Toast.makeText(this, "You selected: " + a, Toast.LENGTH_LONG).show();
        Intent intent = new Intent(this, StudentActivity.class);
        startActivity(intent);

    }


}

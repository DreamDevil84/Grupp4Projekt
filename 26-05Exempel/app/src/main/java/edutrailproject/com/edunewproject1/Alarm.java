package edutrailproject.com.edunewproject1;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.icu.util.Calendar;
import android.support.v4.app.NotificationCompat;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.widget.Toast;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import java.util.Date;

/**
 * Created by ericapalm on 2017-05-29.
 */

public class Alarm extends BroadcastReceiver{

    public static final String TAG = "Mehe";

    private String feedbackType;

    private FirebaseAuth firebaseAuth;
    private DatabaseReference fRef;

    @Override
    public void onReceive(final Context context, Intent intent) {
        Log.e(TAG, "Blipediblop");
        firebaseAuth = FirebaseAuth.getInstance();
        final FirebaseUser user = firebaseAuth.getCurrentUser();
        final NotificationManager notif = (NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);

        if (feedbackType.equals("daily")) {
            fRef = FirebaseDatabase.getInstance().getReference("feedback/daily/" + getDate() + "/hasVoted/" + user.getUid());
            fRef.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    if (dataSnapshot.child("theirVote").getValue() == null) {
                        Log.e(TAG, "Funkar");
                        String title = "Dagens Feedback";
                        String text = "Du har inte get feedback idag";
                        Intent intent = new Intent(context, FeedbackActivity.class);
                        intent.setFlags(intent.FLAG_ACTIVITY_CLEAR_TOP);
                        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_ONE_SHOT);
                        Notification notify = new Notification.Builder(context).setContentTitle(title).setContentText(text)
                                .setSmallIcon(R.drawable.edu).setContentIntent(pendingIntent).build();
                        notif.notify(0, notify);
                    } else {
                        Log.e(TAG, "Den hittar inget, waaah");

                    }
                }


                @Override
                public void onCancelled(DatabaseError databaseError) {

                }
            });
        }
        else if (feedbackType.equals("weekly")){
            fRef = FirebaseDatabase.getInstance().getReference("feedback/weekly/" + getWeek() + "/haveAnswered/");
            fRef.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    if (dataSnapshot.child(user.getUid()).getValue() == null) {
                        Log.e(TAG, "Funkar");
                        String title = "Veckans Feedback";
                        String text = "Du har inte get feedback denna vecka";
                        Intent intent = new Intent(context, FeedbackActivity.class);
                        intent.setFlags(intent.FLAG_ACTIVITY_CLEAR_TOP);
                        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_ONE_SHOT);
                        Notification notify = new Notification.Builder(context).setContentTitle(title).setContentText(text)
                                .setSmallIcon(R.drawable.edu).setContentIntent(pendingIntent).build();
                        notif.notify(0, notify);
                    } else {
                        Log.e(TAG, "Den hittar inget, waaah");

                    }
                }


                @Override
                public void onCancelled(DatabaseError databaseError) {

                }
            });
        }
    }
    public void setAlarm(Context context, String type)
    {
        Calendar calender = Calendar.getInstance();

        feedbackType = type;

        AlarmManager am = (AlarmManager)context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, Alarm.class);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, intent, 0);
        if(type.equals("daily"))
        {
            calender.set(Calendar.HOUR_OF_DAY, 16);
            am.setInexactRepeating(AlarmManager.RTC, calender.getTimeInMillis(), AlarmManager.INTERVAL_DAY, pendingIntent);
        }
        else if (type.equals("weekly"))
        {
            calender.set(Calendar.HOUR_OF_DAY, 16);
            calender.set(Calendar.DAY_OF_WEEK, Calendar.FRIDAY);
            am.setInexactRepeating(AlarmManager.RTC, calender.getTimeInMillis(), 1000 * 60 * 60 * 24 * 7 , pendingIntent);
        }
    }

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
    public String getWeek() {
        
        Calendar calendar = Calendar.getInstance();
        String week = calendar.YEAR + "_" + calendar.WEEK_OF_YEAR;
        return week;

    }
}

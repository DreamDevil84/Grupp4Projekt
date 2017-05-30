package edutrailproject.com.edunewproject1;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import android.support.annotation.IntDef;
import android.support.v4.app.NotificationCompat;

public class FeedbackReminder extends Service {

    Alarm dailyAlarm = new Alarm();
    Alarm weeklyAlarm = new Alarm();

    public FeedbackReminder() {
    }


    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        dailyAlarm.setAlarm(this, "daily");
        weeklyAlarm.setAlarm(this, "weekly");
        return super.onStartCommand(intent, flags, startId);
    }

    @Override
    public IBinder onBind(Intent intent) {
        // TODO: Return the communication channel to the service.
        throw new UnsupportedOperationException("Not yet implemented");
    }
}

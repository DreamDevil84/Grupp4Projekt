package edutrailproject.com.edunewproject1;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.widget.ListView;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class StudentNews extends AppCompatActivity {

    public static final String TAG = "debug";

    ListView newsList;
    private List<DisplayNews> displayNewsList;
    private List<String> userCoursesList;
    private DatabaseReference nRef;
    private DatabaseReference uDatabase;
    private FirebaseAuth firebaseAuth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_student_news);

        newsList = (ListView) findViewById(R.id.newsList);

        userCoursesList = new ArrayList<>();
        displayNewsList = new ArrayList<>();

    }

    @Override
    protected void onStart() {
        super.onStart();

        firebaseAuth = FirebaseAuth.getInstance();
        FirebaseUser user = firebaseAuth.getCurrentUser();

        nRef = FirebaseDatabase.getInstance().getReference("news");
        uDatabase = FirebaseDatabase.getInstance().getReference("users/" + user.getUid() + "/courses");
        uDatabase.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                userCoursesList.clear();
                nRef = FirebaseDatabase.getInstance().getReference("news/general");
                nRef.addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot dataSnapshot) {
                        for (DataSnapshot newsSnap: dataSnapshot.getChildren())
                        {
                            String title = (String) newsSnap.child("title").getValue();
                            String content = (String) newsSnap.child("content").getValue();
                            String time = newsSnap.getKey();
                            String type = "Everyone";
                            DisplayNews news = new DisplayNews(title, content, type, time);
                            displayNewsList.add(news);
                            Log.e(TAG, news.title);
                            Log.e(TAG, news.content);
                            Log.e(TAG, news.type);
                        }
                        DisplayNewsList adapter = new DisplayNewsList(StudentNews.this, displayNewsList);
                        newsList.setAdapter(adapter);
                    }

                    @Override
                    public void onCancelled(DatabaseError databaseError) {

                    }
                });
                for (final DataSnapshot keySnapshot : dataSnapshot.getChildren())
                {
                    //userCoursesList.add(keySnapshot.getKey());
                    //Log.e(TAG, keySnapshot.getKey());

                    nRef = FirebaseDatabase.getInstance().getReference("news/" + keySnapshot.getKey());
                    nRef.addListenerForSingleValueEvent(new ValueEventListener() {
                        @Override
                        public void onDataChange(DataSnapshot dataSnapshot) {
                            for (DataSnapshot newsSnap: dataSnapshot.getChildren())
                            {
                                String title = (String) newsSnap.child("title").getValue();
                                String content = (String) newsSnap.child("content").getValue();
                                String time = newsSnap.getKey();
                                String type = keySnapshot.getKey();
                                DisplayNews news = new DisplayNews(title, content, type, time);
                                displayNewsList.add(news);
                                Log.e(TAG, news.title);
                                Log.e(TAG, news.content);
                                Log.e(TAG, news.type);
                            }
                            Collections.sort(displayNewsList, new Comparator<DisplayNews>() {
                                @Override
                                public int compare(DisplayNews o1, DisplayNews o2) {
                                    return o2.timestamp.compareTo(o1.timestamp);
                                }
                            });
                            DisplayNewsList adapter = new DisplayNewsList(StudentNews.this, displayNewsList);
                            newsList.setAdapter(adapter);
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
}

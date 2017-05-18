package bettercallnilsson.com.androidapp1;

import android.app.Activity;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import java.util.List;

/**
 * Created by sebastiannilsson on 2017-05-17.
 */

public class CourseList extends ArrayAdapter<Courses> {

    private Activity context;
    private List<Courses> courseList;

    public CourseList (Activity context, List<Courses> courseList){
        super(context, R.layout.list_layout, courseList);
        this.context = context;
        this.courseList = courseList;
    }

    @NonNull
    @Override
    public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {

        LayoutInflater inflater = context.getLayoutInflater();

        View listViewItem = inflater.inflate(R.layout.list_layout, null, true);

        TextView courseTitle = (TextView) listViewItem.findViewById(R.id.courseTitle);
        TextView courseDesc = (TextView) listViewItem.findViewById(R.id.courseDesc);

        Courses courses = courseList.get(position);

        courseTitle.setText(courses.getTitle());
        courseDesc.setText(courses.getDescription());

        return listViewItem;

    }
}

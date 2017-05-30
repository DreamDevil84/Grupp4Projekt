package edutrailproject.com.edunewproject1;


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
 * Created by ericapalm on 2017-05-22.
 */

class DisplayCourseList extends ArrayAdapter<DisplayCourses>{

    private Activity context;
    private List<DisplayCourses> displayCourseList;

    public DisplayCourseList (Activity context, List<DisplayCourses> displayCourseList){
        super(context, R.layout.list_layout, displayCourseList);
        this.context = context;
        this.displayCourseList = displayCourseList;
    }

    @NonNull
    @Override
    public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {

        LayoutInflater inflater = context.getLayoutInflater();

        View listViewItem = inflater.inflate(R.layout.list_layout, null, true);

        TextView courseTitle = (TextView) listViewItem.findViewById(R.id.courseTitle);
        TextView courseDesc = (TextView) listViewItem.findViewById(R.id.courseDesc);

        DisplayCourses courses = displayCourseList.get(position);

        courseTitle.setText(courses.getTitle());
        courseDesc.setText(courses.getDescription());

        return listViewItem;

    }
}

package edutrailproject.com.edunewproject1;


import android.app.Activity;
import android.content.Context;
import android.support.annotation.LayoutRes;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import java.util.List;

/**
 * Created by ericapalm on 2017-05-23.
 */

public class DisplayGradeWorkList extends ArrayAdapter<GradeWork> {
    private Activity context;
    private List<GradeWork> gradeWorkList;

    public DisplayGradeWorkList(@NonNull Activity context, List<GradeWork> gradeWorkList) {
        super(context, R.layout.gradework_layout, gradeWorkList);
        this.context = context;
        this.gradeWorkList = gradeWorkList;
    }

    @NonNull
    @Override
    public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {

        LayoutInflater inflater = context.getLayoutInflater();

        View listViewItem = inflater.inflate(R.layout.gradework_layout, null, true);

        TextView gradeName = (TextView) listViewItem.findViewById(R.id.gradeWorkName);
        TextView gradeValue = (TextView) listViewItem.findViewById(R.id.gradeWorkValue);

        GradeWork gradeWork = gradeWorkList.get(position);

        gradeName.setText(gradeWork.name);
        gradeValue.setText(gradeWork.grade);

        return listViewItem;

    }
}

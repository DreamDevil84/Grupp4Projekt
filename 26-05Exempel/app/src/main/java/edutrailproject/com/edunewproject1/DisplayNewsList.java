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
 * Created by ericapalm on 2017-05-29.
 */

public class DisplayNewsList extends ArrayAdapter<DisplayNews>{
    private Activity context;
    private List<DisplayNews> dNewsList;

    public DisplayNewsList(Activity context, List<DisplayNews> dNewsList) {
        super(context, R.layout.news_layout, dNewsList);
        this.context = context;
        this.dNewsList = dNewsList;


    }

    @NonNull
    @Override
    public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {

        LayoutInflater inflater = context.getLayoutInflater();

        View listViewItem = inflater.inflate(R.layout.news_layout, null, true);

        TextView newsTitle = (TextView) listViewItem.findViewById(R.id.txtTitle);
        TextView newsContent = (TextView) listViewItem.findViewById(R.id.txtContent);
        TextView newsType = (TextView) listViewItem.findViewById(R.id.txtType);
        TextView newsTime = (TextView) listViewItem.findViewById(R.id.txtTime);

        DisplayNews displayNews = dNewsList.get(position);

        newsTitle.setText(displayNews.title);
        newsContent.setText(displayNews.content);
        newsType.setText(displayNews.type);
        newsTime.setText(displayNews.timestamp);

        return listViewItem;

    }

}

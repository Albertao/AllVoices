package com.allvoices;

import android.os.Parcel;
import android.os.Parcelable;

import com.facebook.react.bridge.ReadableArray;

/**
 * Created by 80713 on 2017/8/23.
 */

public class SongList implements Parcelable {

    private int id;
    private String songName;
    private String songUrl;
    private String author;
    private String albumName;
    private String albumPic;

    public int getId() {
        return this.id;
    }

    public String getSongName() {
        return songName;
    }

    public String getSongUrl() {
        return songUrl;
    }

    public String getAuthor() {
        return author;
    }

    public String getAlbumName() {
        return albumName;
    }

    public String getAlbumPic() {
        return albumPic;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setSongName(String songName) {
        this.songName = songName;
    }

    public void setSongUrl(String songUrl) {
        this.songUrl = songUrl;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public void setAlbumName(String albumName) {
        this.albumName = albumName;
    }

    public void setAlbumPic(String albumPic) {
        this.albumPic = albumPic;
    }

    @Override
    public int describeContents() {
        //return nothing.
        return 0;
    }

    @Override
    public void writeToParcel(Parcel arg0, int arg1) {
        // TODO Auto-generated method stub
        // 1.必须按成员变量声明的顺序封装数据，不然会出现获取数据出错
        // 2.序列化对象
        arg0.writeInt(id);
        arg0.writeString(songName);
        arg0.writeString(songUrl);
        arg0.writeString(author);
        arg0.writeString(albumName);
        arg0.writeString(albumPic);
    }


    // 1.必须实现Parcelable.Creator接口,否则在获取Person数据的时候，会报错，如下：
    // android.os.BadParcelableException:
    // Parcelable protocol requires a Parcelable.Creator object called  CREATOR on class com.um.demo.Person
    // 2.这个接口实现了从Percel容器读取Person数据，并返回Person对象给逻辑层使用
    // 3.实现Parcelable.Creator接口对象名必须为CREATOR，不如同样会报错上面所提到的错；
    // 4.在读取Parcel容器里的数据事，必须按成员变量声明的顺序读取数据，不然会出现获取数据出错
    // 5.反序列化对象
    public static final Parcelable.Creator<SongList> CREATOR = new Parcelable.Creator<SongList>(){

        @Override
        public SongList createFromParcel(Parcel source) {
            // TODO Auto-generated method stub
            // 必须按成员变量声明的顺序读取数据，不然会出现获取数据出错
            SongList p = new SongList();
            p.setId(source.readInt());
            p.setSongName(source.readString());
            p.setSongUrl(source.readString());
            p.setAuthor(source.readString());
            p.setAlbumName(source.readString());
            p.setAlbumPic(source.readString());
            return p;
        }

        @Override
        public SongList[] newArray(int size) {
            // TODO Auto-generated method stub
            return new SongList[size];
        }
    };
}

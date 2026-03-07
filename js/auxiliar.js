function getMonth(number){

  if(number < 1 || number > 12) return -1;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "June",
            "July", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  return months[number-1];

}

export function getDate(post){

  const post_time = post.published_at.split('T');
  const date = post_time[0].split('-');
  const day = parseInt(date[2]);
  const month = getMonth(parseInt(date[1]));
  if(month === -1){
    console.error("Invalid Month");
    return;
  }
  const date_tag = `${day} ${month}`;

  return date_tag;
}


export function getTags(v_tags){

  const tags = [];

  v_tags.forEach(tag => {
    tags.push(tag.name);
  });

  return tags;
}

export function getAllTags(v_posts){

  const tags = [];

  v_posts.forEach(post => {

    post.tags.forEach(tag => {
      if( contains(tag.name, tags) === -1)
        tags.push(tag.name);
    })

  })

  return tags;

}

export function contains(x, v){

  for(let i = 0; i<v.length; ++i){
    if(v[i] === x) return i;
  }

  return -1;

}

export function startsWith(str, tag){

  const tag_name = tag.toLowerCase();

  if(tag_name.slice(0,str.length) === str)
    return true;

  return false

}
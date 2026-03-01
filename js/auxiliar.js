function getMonth(number){

  if(number < 1 || number > 12) return -1;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "June",
            "July", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  return months[number-1];

}

export function getDate(date){

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